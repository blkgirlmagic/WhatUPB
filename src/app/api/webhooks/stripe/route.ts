import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { getStripe } from "@/lib/stripe";
import Stripe from "stripe";

// Service-role client for webhook-driven writes (no user session)
function getSupabaseAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

export async function POST(request: NextRequest) {
  const body = await request.text();
  const sig = request.headers.get("stripe-signature");

  if (!sig) {
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }

  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!webhookSecret) {
    console.error("[stripe-webhook] STRIPE_WEBHOOK_SECRET not set");
    return NextResponse.json(
      { error: "Webhook not configured" },
      { status: 500 }
    );
  }

  const stripe = getStripe();

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, sig, webhookSecret);
  } catch (err) {
    console.error(
      "[stripe-webhook] Signature verification failed:",
      err instanceof Error ? err.message : err
    );
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  const supabase = getSupabaseAdmin();

  console.log(`[stripe-webhook] Processing event: ${event.type} (${event.id})`);

  switch (event.type) {
    // ---- PRIMARY: Checkout completed (payment confirmed) ----
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session;

      if (session.mode !== "subscription" || !session.subscription) {
        console.log("[stripe-webhook] checkout.session.completed: not a subscription, skipping");
        break;
      }

      // Retrieve the full subscription to get metadata + period info
      const sub = await stripe.subscriptions.retrieve(
        typeof session.subscription === "string"
          ? session.subscription
          : session.subscription.id
      );

      // Try metadata first, then fall back to customer lookup
      let userId = sub.metadata?.supabase_user_id;

      if (!userId) {
        const customerId =
          typeof session.customer === "string"
            ? session.customer
            : session.customer?.id;

        if (customerId) {
          const { data: profile } = await supabase
            .from("profiles")
            .select("id")
            .eq("stripe_customer_id", customerId)
            .single();

          userId = profile?.id;
        }
      }

      if (!userId) {
        console.error(
          "[stripe-webhook] checkout.session.completed: could not resolve user"
        );
        break;
      }

      const firstItem = sub.items?.data?.[0];
      const periodEnd = firstItem?.current_period_end ?? null;
      const expiresAt = periodEnd
        ? new Date(periodEnd * 1000).toISOString()
        : null;

      const { error } = await supabase
        .from("profiles")
        .update({
          is_premium: true,
          stripe_subscription_id: sub.id,
          premium_expires_at: expiresAt,
        })
        .eq("id", userId);

      if (error) {
        console.error("[stripe-webhook] checkout.session.completed: DB error:", error.message);
      } else {
        console.log(
          `[stripe-webhook] checkout.session.completed: user ${userId} upgraded to premium, expires=${expiresAt}`
        );
      }
      break;
    }

    // ---- FALLBACK: Subscription created or renewed ----
    case "customer.subscription.created":
    case "customer.subscription.updated": {
      const sub = event.data.object as Stripe.Subscription;
      let userId = sub.metadata?.supabase_user_id;

      // Fallback: look up user by stripe_customer_id
      if (!userId) {
        const customerId =
          typeof sub.customer === "string"
            ? sub.customer
            : (sub.customer as Stripe.Customer)?.id;

        if (customerId) {
          const { data: profile } = await supabase
            .from("profiles")
            .select("id")
            .eq("stripe_customer_id", customerId)
            .single();

          userId = profile?.id;
        }
      }

      if (!userId) {
        console.warn("[stripe-webhook] No user found for subscription", sub.id);
        break;
      }

      const isActive =
        sub.status === "active" || sub.status === "trialing";

      // In Stripe v2025+, current_period_end lives on SubscriptionItem
      const firstItem = sub.items?.data?.[0];
      const periodEnd = firstItem?.current_period_end ?? null;
      const expiresAt = periodEnd
        ? new Date(periodEnd * 1000).toISOString()
        : null;

      // Idempotency guard — skip if profile already matches this subscription state
      const { data: existing } = await supabase
        .from("profiles")
        .select("is_premium, stripe_subscription_id, premium_expires_at")
        .eq("id", userId)
        .single();

      if (
        existing &&
        existing.stripe_subscription_id === sub.id &&
        existing.is_premium === isActive &&
        existing.premium_expires_at === expiresAt
      ) {
        console.log(
          `[stripe-webhook] Skipping duplicate event ${event.id} for user ${userId}`
        );
        break;
      }

      const { error } = await supabase
        .from("profiles")
        .update({
          is_premium: isActive,
          stripe_subscription_id: sub.id,
          premium_expires_at: expiresAt,
        })
        .eq("id", userId);

      if (error) {
        console.error("[stripe-webhook] Failed to update profile:", error.message);
      } else {
        console.log(
          `[stripe-webhook] User ${userId} premium=${isActive} expires=${expiresAt}`
        );
      }
      break;
    }

    // ---- Subscription cancelled or expired ----
    case "customer.subscription.deleted": {
      const sub = event.data.object as Stripe.Subscription;
      let userId = sub.metadata?.supabase_user_id;

      // Fallback: look up user by stripe_customer_id
      if (!userId) {
        const customerId =
          typeof sub.customer === "string"
            ? sub.customer
            : (sub.customer as Stripe.Customer)?.id;

        if (customerId) {
          const { data: profile } = await supabase
            .from("profiles")
            .select("id")
            .eq("stripe_customer_id", customerId)
            .single();

          userId = profile?.id;
        }
      }

      if (!userId) break;

      const { error } = await supabase
        .from("profiles")
        .update({
          is_premium: false,
          stripe_subscription_id: null,
          premium_expires_at: null,
        })
        .eq("id", userId);

      if (error) {
        console.error("[stripe-webhook] Failed to downgrade:", error.message);
      } else {
        console.log(`[stripe-webhook] User ${userId} downgraded to free`);
      }
      break;
    }

    default:
      console.log(`[stripe-webhook] Unhandled event type: ${event.type}`);
      break;
  }

  return NextResponse.json({ received: true });
}

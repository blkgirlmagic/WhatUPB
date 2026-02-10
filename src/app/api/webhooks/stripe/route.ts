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

  let event: Stripe.Event;
  try {
    const stripe = getStripe();
    event = stripe.webhooks.constructEvent(body, sig, webhookSecret);
  } catch (err) {
    console.error(
      "[stripe-webhook] Signature verification failed:",
      err instanceof Error ? err.message : err
    );
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  const supabase = getSupabaseAdmin();

  switch (event.type) {
    // ---- Subscription created or renewed ----
    case "customer.subscription.created":
    case "customer.subscription.updated": {
      const sub = event.data.object as Stripe.Subscription;
      const userId = sub.metadata.supabase_user_id;
      if (!userId) {
        console.warn("[stripe-webhook] No supabase_user_id in subscription metadata");
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
      const userId = sub.metadata.supabase_user_id;
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
      // Unhandled event type — acknowledge receipt
      break;
  }

  return NextResponse.json({ received: true });
}

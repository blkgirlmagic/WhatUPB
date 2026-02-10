import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { getStripe } from "@/lib/stripe";

export async function POST() {
  // 1. Authenticate
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // Server Component context
          }
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // 2. Check if already premium
  const { data: profile } = await supabase
    .from("profiles")
    .select("is_premium, stripe_customer_id")
    .eq("id", user.id)
    .single();

  if (profile?.is_premium) {
    return NextResponse.json(
      { error: "Already subscribed to Premium." },
      { status: 400 }
    );
  }

  const priceId = process.env.STRIPE_PRICE_ID;
  if (!priceId) {
    console.error("[checkout] STRIPE_PRICE_ID not set");
    return NextResponse.json(
      { error: "Payments not configured." },
      { status: 500 }
    );
  }

  try {
    const stripe = getStripe();

    // 3. Re-use existing Stripe customer or create new
    let customerId = profile?.stripe_customer_id;
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user.email,
        metadata: { supabase_user_id: user.id },
      });
      customerId = customer.id;

      await supabase
        .from("profiles")
        .update({ stripe_customer_id: customerId })
        .eq("id", user.id);
    }

    // 4. Create checkout session
    const origin =
      process.env.NEXT_PUBLIC_APP_URL || "https://whatupb.com";

    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: "subscription",
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${origin}/settings?upgraded=true`,
      cancel_url: `${origin}/settings`,
      subscription_data: {
        metadata: { supabase_user_id: user.id },
      },
    });

    return NextResponse.json({ url: session.url });
  } catch (err) {
    console.error(
      "[checkout] Stripe error:",
      err instanceof Error ? err.message : err
    );
    return NextResponse.json(
      { error: "Failed to create checkout session." },
      { status: 500 }
    );
  }
}

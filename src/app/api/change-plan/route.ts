import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { getStripe } from "@/lib/stripe";
import { requireCsrfHeader } from "@/lib/csrf";

export async function POST(request: Request) {
  // 0. CSRF protection
  const csrfError = requireCsrfHeader(request);
  if (csrfError) return csrfError;
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

  const { data: profile } = await supabase
    .from("profiles")
    .select("stripe_subscription_id")
    .eq("id", user.id)
    .single();

  if (!profile?.stripe_subscription_id) {
    return NextResponse.json(
      { error: "No active subscription found." },
      { status: 400 }
    );
  }

  const body = await request.json().catch(() => ({}));
  const plan = body.plan as string;

  const priceMap: Record<string, string | undefined> = {
    weekly: process.env.STRIPE_PRICE_ID_WEEKLY,
    monthly: process.env.STRIPE_PRICE_ID_MONTHLY,
    yearly: process.env.STRIPE_PRICE_ID_YEARLY,
  };

  const newPriceId = priceMap[plan];
  if (!newPriceId) {
    return NextResponse.json(
      { error: "Invalid plan." },
      { status: 400 }
    );
  }

  try {
    const stripe = getStripe();

    // Retrieve the current subscription to get the item ID
    const subscription = await stripe.subscriptions.retrieve(
      profile.stripe_subscription_id
    );

    const currentItem = subscription.items.data[0];
    if (!currentItem) {
      return NextResponse.json(
        { error: "Subscription has no items." },
        { status: 400 }
      );
    }

    // Skip if already on this price
    if (currentItem.price.id === newPriceId) {
      return NextResponse.json(
        { error: "Already on this plan." },
        { status: 400 }
      );
    }

    // Update the subscription to the new price with proration
    await stripe.subscriptions.update(profile.stripe_subscription_id, {
      items: [{ id: currentItem.id, price: newPriceId }],
      proration_behavior: "create_prorations",
    });

    // The webhook (customer.subscription.updated) will update the DB
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error(
      "[change-plan] Stripe error:",
      err instanceof Error ? err.message : err
    );
    return NextResponse.json(
      { error: "Failed to change plan." },
      { status: 500 }
    );
  }
}

import { createClient } from "@/lib/supabase-server";
import { redirect } from "next/navigation";
import Link from "next/link";

const PLAN_DETAILS: Record<string, { name: string; price: string }> = {
  weekly: { name: "Weekly", price: "$0.99/week" },
  monthly: { name: "Monthly", price: "$4.99/month" },
  yearly: { name: "Yearly", price: "$39.99/year" },
};

const PREMIUM_PERKS = [
  { icon: "M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4", label: "Unlimited message history" },
  { icon: "M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z", label: "Keyword filters" },
  { icon: "M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01", label: "Custom link themes" },
];

export default async function CheckoutSuccess({
  searchParams,
}: {
  searchParams: Promise<{ plan?: string }>;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const params = await searchParams;
  const planKey = params.plan || "monthly";
  const plan = PLAN_DETAILS[planKey] || PLAN_DETAILS.monthly;

  return (
    <div className="min-h-screen px-4 py-12 flex items-center justify-center">
      <div className="max-w-md w-full text-center">
        {/* Animated checkmark */}
        <div className="animate-fade-in-up mb-6">
          <div
            className="w-20 h-20 rounded-full mx-auto flex items-center justify-center"
            style={{
              background: "linear-gradient(135deg, #a855f7, #7c3aed)",
              boxShadow: "0 0 40px rgba(168, 85, 247, 0.3)",
            }}
          >
            <svg
              className="w-10 h-10 text-white animate-check-scale"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
        </div>

        {/* Heading */}
        <div className="animate-fade-in-up-delay-1">
          <h1 className="text-2xl font-bold text-white mb-2">
            Welcome to Premium!
          </h1>
          <p className="text-zinc-400 text-sm mb-1">
            You&apos;re now on the{" "}
            <span className="text-purple-300 font-semibold">
              {plan.name}
            </span>{" "}
            plan
          </p>
          <p className="text-zinc-600 text-xs">{plan.price}</p>
        </div>

        {/* Unlocked features */}
        <div className="card mt-8 text-left animate-fade-in-up-delay-2" style={{
          border: "1px solid rgba(168, 85, 247, 0.2)",
          boxShadow: "0 0 30px rgba(168, 85, 247, 0.06)",
        }}>
          <p className="text-xs font-medium uppercase tracking-wider text-zinc-500 mb-4">
            What you unlocked
          </p>
          <div className="flex flex-col gap-3">
            {PREMIUM_PERKS.map((perk) => (
              <div key={perk.label} className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-purple-500/10 border border-purple-500/20 flex items-center justify-center shrink-0">
                  <svg
                    className="w-4 h-4 text-purple-300"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={1.5}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d={perk.icon}
                    />
                  </svg>
                </div>
                <span className="text-sm text-zinc-300">{perk.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="mt-8 flex flex-col gap-3 animate-fade-in-up-delay-3">
          <Link href="/inbox" className="btn-primary py-3 text-sm">
            <svg
              className="w-4.5 h-4.5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
              />
            </svg>
            Go to Inbox
          </Link>
          <Link
            href="/settings"
            className="text-xs text-zinc-500 hover:text-zinc-300 transition"
          >
            or go to Settings
          </Link>
        </div>
      </div>
    </div>
  );
}

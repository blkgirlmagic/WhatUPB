import Link from "next/link";

export const metadata = {
  title: "Support — WhatUPB",
  description:
    "Get help with your WhatUPB account, subscription, or platform questions.",
};

export default function Support() {
  return (
    <div className="min-h-screen flex flex-col items-center px-4 py-16">
      <div className="w-full max-w-3xl">
        {/* Header */}
        <div className="mb-12">
          <Link
            href="/"
            className="text-sm text-denim-200 hover:text-denim-100 transition"
          >
            &larr; Back to WhatUPB
          </Link>
          <h1 className="text-3xl font-bold mt-6 tracking-tight">
            Support &ndash; WhatUPB
          </h1>
          <p className="text-zinc-500 text-sm mt-2">
            Last updated: March 2026
          </p>
        </div>

        {/* Content */}
        <div className="space-y-10 text-zinc-400 text-sm leading-relaxed">
          <section>
            <p>
              Welcome to the WhatUPB Support Center. If you need help with your
              account, subscription, or have questions about using the platform,
              please contact our support team.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-3">
              Contact Support
            </h2>
            <p className="mb-2">
              Email support is the fastest way to reach us.
            </p>
            <ul className="list-disc list-inside space-y-2 text-zinc-500">
              <li>
                <span className="text-zinc-400">Email:</span>{" "}
                <a
                  href="mailto:contact.whatupb@gmail.com"
                  className="text-denim-200 hover:text-denim-100 underline transition"
                >
                  contact.whatupb@gmail.com
                </a>
              </li>
            </ul>
            <p className="mt-4">
              We typically respond within 24&ndash;48 hours.
            </p>
          </section>
        </div>

        {/* Footer nav */}
        <div className="mt-16 pt-8 border-t border-border-subtle flex flex-wrap gap-x-6 gap-y-2 text-xs text-zinc-600">
          <Link href="/" className="hover:text-zinc-400 transition">
            Home
          </Link>
          <Link
            href="/privacy"
            className="hover:text-zinc-400 transition"
          >
            Privacy Policy
          </Link>
          <Link
            href="/terms"
            className="hover:text-zinc-400 transition"
          >
            Terms of Service
          </Link>
          <Link
            href="/content-policy"
            className="hover:text-zinc-400 transition"
          >
            Content Policy
          </Link>
          <Link
            href="/safety"
            className="hover:text-zinc-400 transition"
          >
            Safety
          </Link>
        </div>
      </div>
    </div>
  );
}

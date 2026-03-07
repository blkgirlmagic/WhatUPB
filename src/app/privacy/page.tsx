import Link from "next/link";

export const metadata = {
  title: "Privacy Policy — WhatUPB",
  description: "How WhatUPB collects, uses, and protects your data.",
};

export default function PrivacyPolicy() {
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
            Privacy Policy
          </h1>
          <p className="text-zinc-500 text-sm mt-2">
            Effective date: March 8, 2026
          </p>
        </div>

        {/* Content */}
        <div className="space-y-10 text-zinc-400 text-sm leading-relaxed">
          <section>
            <p>
              WhatUPB is operated by Aurora Bridge LLC. This Privacy Policy
              explains what data we collect, how we use it, and your rights
              regarding that data. By using WhatUPB, you agree to the practices
              described below.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-3">
              1. Information We Collect
            </h2>
            <p className="mb-3">
              We collect the following information when you use WhatUPB:
            </p>
            <ul className="list-disc list-inside space-y-2 text-zinc-500">
              <li>
                <span className="text-zinc-400">Account information:</span>{" "}
                your email address and username when you create an account.
              </li>
              <li>
                <span className="text-zinc-400">Messages:</span> anonymous
                messages sent to and from your profile. Messages sent
                anonymously cannot be traced back to the sender.
              </li>
              <li>
                <span className="text-zinc-400">Hashed IP addresses:</span> we
                store one-way hashes of IP addresses for spam and abuse
                prevention. We do NOT store raw IP addresses. These hashes
                cannot be reversed to identify you.
              </li>
              <li>
                <span className="text-zinc-400">Payment information:</span> if
                you subscribe to a paid plan, payment is processed entirely by
                Stripe. We do not store your credit card number, bank account
                details, or any sensitive financial information on our servers.
              </li>
              <li>
                <span className="text-zinc-400">Age verification:</span> we
                record that you confirmed you are 18 or older. We do not store
                your date of birth.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-3">
              2. How We Use Your Information
            </h2>
            <ul className="list-disc list-inside space-y-2 text-zinc-500">
              <li>To provide and maintain the WhatUPB service.</li>
              <li>
                To prevent abuse and spam using hashed IP addresses and
                automated content moderation.
              </li>
              <li>To process payments and manage subscriptions via Stripe.</li>
              <li>
                To send important account-related emails (e.g., email
                confirmation, security alerts).
              </li>
              <li>To enforce our Terms of Service and Content Policy.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-3">
              3. Anonymity of Messages
            </h2>
            <p>
              Messages sent through WhatUPB are anonymous. We do not store
              sender identity information with messages. Recipients cannot see
              who sent them a message, and we cannot trace anonymous messages
              back to the sender.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-3">
              4. Automated Content Moderation
            </h2>
            <p>
              We use the Google Perspective API to automatically analyze
              messages for toxic, threatening, or abusive content. This
              processing happens in real time when a message is submitted.
              Messages that exceed our toxicity thresholds may be blocked
              automatically. No human reviews your messages.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-3">
              5. Payment Processing
            </h2>
            <p>
              All payment processing is handled by Stripe. When you subscribe
              to a paid plan, your payment information is collected and
              processed directly by Stripe in accordance with their{" "}
              <a
                href="https://stripe.com/privacy"
                target="_blank"
                rel="noopener noreferrer"
                className="text-denim-200 hover:text-denim-100 underline transition"
              >
                Privacy Policy
              </a>
              . We receive only limited information from Stripe, such as
              subscription status and the last four digits of your card, to
              display in your account settings.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-3">
              6. Third-Party Services
            </h2>
            <p className="mb-3">
              We use the following third-party services to operate WhatUPB:
            </p>
            <ul className="list-disc list-inside space-y-2 text-zinc-500">
              <li>
                <span className="text-zinc-400">Stripe</span> — payment
                processing (
                <a
                  href="https://stripe.com/privacy"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-denim-200 hover:text-denim-100 underline transition"
                >
                  stripe.com/privacy
                </a>
                )
              </li>
              <li>
                <span className="text-zinc-400">Google Perspective API</span> —
                automated content moderation
              </li>
              <li>
                <span className="text-zinc-400">Supabase</span> —
                authentication and database
              </li>
              <li>
                <span className="text-zinc-400">PostHog</span> — product
                analytics (
                <a
                  href="https://posthog.com/privacy"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-denim-200 hover:text-denim-100 underline transition"
                >
                  posthog.com/privacy
                </a>
                )
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-3">
              7. Cookies and Authentication
            </h2>
            <p>
              We use Supabase for authentication. Cookies are used solely to
              maintain your login session and are essential for the service to
              function. We do not use tracking cookies or third-party
              advertising cookies.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-3">
              8. Data Retention
            </h2>
            <p>
              We retain your account information and messages for as long as
              your account is active. If you delete your account, we will
              delete your personal data within 30 days, except where we are
              required to retain it for legal or security purposes (e.g.,
              hashed IP data used for abuse prevention).
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-3">
              9. Your Rights
            </h2>
            <p className="mb-3">You have the right to:</p>
            <ul className="list-disc list-inside space-y-2 text-zinc-500">
              <li>Access the personal data we hold about you.</li>
              <li>Request correction of inaccurate data.</li>
              <li>Request deletion of your account and associated data.</li>
              <li>
                Opt out of non-essential data collection (note: we do not
                currently engage in non-essential data collection).
              </li>
            </ul>
            <p className="mt-3">
              To exercise any of these rights, contact us at{" "}
              <a
                href="mailto:contact.whatupb@gmail.com"
                className="text-denim-200 hover:text-denim-100 underline transition"
              >
                contact.whatupb@gmail.com
              </a>
              .
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-3">
              10. CCPA (California Residents)
            </h2>
            <p>
              If you are a California resident, the California Consumer Privacy
              Act (CCPA) grants you the right to know what personal information
              we collect, request its deletion, and opt out of its sale. We do
              not sell your personal information. To submit a request, email us
              at{" "}
              <a
                href="mailto:contact.whatupb@gmail.com"
                className="text-denim-200 hover:text-denim-100 underline transition"
              >
                contact.whatupb@gmail.com
              </a>
              .
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-3">
              11. GDPR (European Residents)
            </h2>
            <p>
              If you are located in the European Economic Area, you have rights
              under the General Data Protection Regulation (GDPR) including the
              right to access, rectify, erase, restrict, and port your data.
              Our legal basis for processing your data is the performance of
              our contract with you (providing the service) and our legitimate
              interest in preventing abuse. To exercise your GDPR rights,
              contact us at{" "}
              <a
                href="mailto:contact.whatupb@gmail.com"
                className="text-denim-200 hover:text-denim-100 underline transition"
              >
                contact.whatupb@gmail.com
              </a>
              .
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-3">
              12. Changes to This Policy
            </h2>
            <p>
              We may update this Privacy Policy from time to time. If we make
              significant changes, we will notify you by email or through the
              service. Your continued use of WhatUPB after changes are posted
              constitutes acceptance of the updated policy.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-3">
              13. Contact Us
            </h2>
            <p>
              If you have questions about this Privacy Policy, contact Aurora
              Bridge LLC at{" "}
              <a
                href="mailto:contact.whatupb@gmail.com"
                className="text-denim-200 hover:text-denim-100 underline transition"
              >
                contact.whatupb@gmail.com
              </a>
              .
            </p>
          </section>
        </div>

        {/* Footer nav */}
        <div className="mt-16 pt-8 border-t border-border-subtle flex flex-wrap gap-x-6 gap-y-2 text-xs text-zinc-600">
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
          <Link href="/" className="hover:text-zinc-400 transition">
            Home
          </Link>
        </div>
      </div>
    </div>
  );
}

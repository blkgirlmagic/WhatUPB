import Link from "next/link";

export const metadata = {
  title: "Terms of Service — WhatUPB",
  description: "Terms and conditions for using WhatUPB.",
};

export default function TermsOfService() {
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
            Terms of Service
          </h1>
          <p className="text-zinc-500 text-sm mt-2">
            Effective date: March 8, 2026
          </p>
        </div>

        {/* Content */}
        <div className="space-y-10 text-zinc-400 text-sm leading-relaxed">
          <section>
            <p>
              WhatUPB is operated by Aurora Bridge LLC. By creating an account
              or using WhatUPB, you agree to these Terms of Service. If you do
              not agree, do not use the service.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-3">
              1. Eligibility
            </h2>
            <p>
              You must be at least 18 years old to use WhatUPB. By creating an
              account, you confirm that you are 18 or older. We verify your age
              during the signup process. If we discover that a user is under 18,
              we will terminate their account immediately.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-3">
              2. Account Responsibility
            </h2>
            <p>
              You are responsible for maintaining the security of your account
              credentials. You are responsible for all activity that occurs
              under your account. If you believe your account has been
              compromised, contact us immediately at{" "}
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
              3. User Content
            </h2>
            <p>
              Users are solely responsible for the content they send through
              WhatUPB, including anonymous messages. While messages are
              anonymous, users must comply with our{" "}
              <Link
                href="/content-policy"
                className="text-denim-200 hover:text-denim-100 underline transition"
              >
                Content Policy
              </Link>{" "}
              at all times.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-3">
              4. Prohibited Content and Conduct
            </h2>
            <p className="mb-3">
              You may not use WhatUPB to send, share, or facilitate any of the
              following:
            </p>
            <ul className="list-disc list-inside space-y-2 text-zinc-500">
              <li>
                Threats of violence or harm against any individual or group.
              </li>
              <li>
                Harassment, bullying, intimidation, or targeted abuse.
              </li>
              <li>
                Child sexual abuse material (CSAM) or any sexual content
                involving minors.
              </li>
              <li>
                Content that promotes or facilitates illegal activity.
              </li>
              <li>
                Spam, scams, phishing, or deceptive content.
              </li>
              <li>
                Personally identifiable information of others without their
                consent (doxxing).
              </li>
              <li>
                Content that incites hatred based on race, ethnicity, gender,
                religion, sexual orientation, disability, or other protected
                characteristics.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-3">
              5. Account Termination
            </h2>
            <p>
              We reserve the right to suspend or terminate your account at any
              time, with or without notice, if we determine that you have
              violated these Terms of Service or our Content Policy. Upon
              termination, your right to use the service ceases immediately. We
              may also report illegal activity to law enforcement as required by
              applicable law.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-3">
              6. Subscriptions and Billing
            </h2>
            <p className="mb-3">
              WhatUPB offers optional paid subscription plans. By subscribing,
              you agree to the following:
            </p>
            <ul className="list-disc list-inside space-y-2 text-zinc-500">
              <li>
                Subscriptions are billed on a recurring basis (monthly or
                annually, depending on the plan you choose).
              </li>
              <li>
                All payments are processed by Stripe. You agree to
                Stripe&apos;s terms when providing payment information.
              </li>
              <li>
                You may cancel your subscription at any time through your
                account settings. Cancellation takes effect at the end of the
                current billing period.
              </li>
              <li>
                We do not offer refunds for partial billing periods. If you
                cancel mid-cycle, you will retain access to paid features until
                the end of that billing period.
              </li>
              <li>
                We reserve the right to change pricing with 30 days notice.
                Continued use after a price change constitutes acceptance.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-3">
              7. Limitation of Liability
            </h2>
            <p>
              To the maximum extent permitted by law, Aurora Bridge LLC and its
              officers, employees, and affiliates shall not be liable for any
              indirect, incidental, special, consequential, or punitive
              damages, including but not limited to loss of data, revenue, or
              profits, arising out of or related to your use of WhatUPB. Our
              total liability for any claim related to the service shall not
              exceed the amount you have paid us in the twelve (12) months
              preceding the claim.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-3">
              8. Disclaimer
            </h2>
            <p>
              WhatUPB is provided &quot;as is&quot; and &quot;as
              available&quot; without warranties of any kind, either express or
              implied, including but not limited to implied warranties of
              merchantability, fitness for a particular purpose, and
              non-infringement. We do not guarantee that the service will be
              uninterrupted, secure, or error-free. We do not guarantee the
              accuracy, completeness, or reliability of any content sent or
              received through the service.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-3">
              9. Indemnification
            </h2>
            <p>
              You agree to indemnify, defend, and hold harmless Aurora Bridge
              LLC and its officers, employees, and affiliates from any claims,
              damages, losses, liabilities, and expenses (including reasonable
              legal fees) arising from your use of the service, your violation
              of these Terms, or your violation of any third-party rights.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-3">
              10. Governing Law
            </h2>
            <p>
              These Terms shall be governed by and construed in accordance with
              the laws of the United States. Any disputes arising under these
              Terms shall be resolved in the courts of competent jurisdiction.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-3">
              11. Changes to These Terms
            </h2>
            <p>
              We may update these Terms of Service from time to time. If we
              make significant changes, we will notify you by email or through
              the service. Your continued use of WhatUPB after changes are
              posted constitutes acceptance of the updated terms.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-3">
              12. Contact Us
            </h2>
            <p>
              If you have questions about these Terms of Service, contact
              Aurora Bridge LLC at{" "}
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
            href="/privacy"
            className="hover:text-zinc-400 transition"
          >
            Privacy Policy
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

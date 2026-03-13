import Link from "next/link";

export const metadata = {
  title: "Terms of Service — WhatUPB",
  description: "Terms and conditions for using WhatUPB.",
};

export default function TermsOfService() {
  return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(180deg, #fdfcfb 0%, #f5f2ed 100%)" }}>
      {/* Nav */}
      <nav style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "20px 32px", maxWidth: 900, margin: "0 auto" }}>
        <Link href="/" style={{ fontWeight: 700, fontSize: 20, color: "#1a1a2e", textDecoration: "none", fontFamily: "'Playfair Display', serif" }}>WhatUPB</Link>
        <div style={{ display: "flex", gap: 24, alignItems: "center", fontSize: 14 }}>
          <Link href="/privacy" style={{ color: "#6b7280", textDecoration: "none" }}>Privacy</Link>
          <Link href="/safety" style={{ color: "#6b7280", textDecoration: "none" }}>Safety</Link>
          <Link href="/support" style={{ color: "#6b7280", textDecoration: "none" }}>Support</Link>
        </div>
      </nav>

      <div style={{ maxWidth: 720, margin: "0 auto", padding: "40px 24px 80px" }}>
        {/* Header */}
        <div style={{ marginBottom: 48 }}>
          <Link href="/" style={{ fontSize: 13, color: "#8b5cf6", textDecoration: "none", display: "inline-flex", alignItems: "center", gap: 4 }}>&larr; Back to WhatUPB</Link>
          <h1 style={{ fontSize: 32, fontWeight: 700, color: "#1a1a2e", marginTop: 20, letterSpacing: "-0.02em" }}>Terms of Service</h1>
          <p style={{ color: "#9ca3af", fontSize: 13, marginTop: 8 }}>Effective date: March 8, 2026</p>
        </div>

        {/* Content */}
        <div style={{ display: "flex", flexDirection: "column", gap: 40 }}>
          <section>
            <p style={{ color: "#4b5563", fontSize: 14, lineHeight: 1.7 }}>
              WhatUPB is operated by Aurora Bridge LLC. By creating an account or using WhatUPB, you agree to these Terms of Service. If you do not agree, do not use the service.
            </p>
          </section>

          <section>
            <h2 style={{ fontSize: 18, fontWeight: 600, color: "#1a1a2e", marginBottom: 12 }}>1. Eligibility</h2>
            <p style={{ color: "#4b5563", fontSize: 14, lineHeight: 1.7 }}>
              You must be at least 18 years old to use WhatUPB. By creating an account, you confirm that you are 18 or older. We verify your age during the signup process. If we discover that a user is under 18, we will terminate their account immediately.
            </p>
          </section>

          <section>
            <h2 style={{ fontSize: 18, fontWeight: 600, color: "#1a1a2e", marginBottom: 12 }}>2. Account Responsibility</h2>
            <p style={{ color: "#4b5563", fontSize: 14, lineHeight: 1.7 }}>
              You are responsible for maintaining the security of your account credentials. You are responsible for all activity that occurs under your account. If you believe your account has been compromised, contact us immediately at{" "}
              <a href="mailto:contact.whatupb@gmail.com" style={{ color: "#8b5cf6", textDecoration: "underline" }}>contact.whatupb@gmail.com</a>.
            </p>
          </section>

          <section>
            <h2 style={{ fontSize: 18, fontWeight: 600, color: "#1a1a2e", marginBottom: 12 }}>3. User Content</h2>
            <p style={{ color: "#4b5563", fontSize: 14, lineHeight: 1.7 }}>
              Users are solely responsible for the content they send through WhatUPB, including anonymous messages. While messages are anonymous, users must comply with our{" "}
              <Link href="/content-policy" style={{ color: "#8b5cf6", textDecoration: "underline" }}>Content Policy</Link> at all times.
            </p>
          </section>

          <section>
            <h2 style={{ fontSize: 18, fontWeight: 600, color: "#1a1a2e", marginBottom: 12 }}>4. Prohibited Content and Conduct</h2>
            <p style={{ color: "#4b5563", fontSize: 14, lineHeight: 1.7, marginBottom: 12 }}>You may not use WhatUPB to send, share, or facilitate any of the following:</p>
            <ul style={{ listStyle: "disc", paddingLeft: 20, display: "flex", flexDirection: "column", gap: 8 }}>
              <li style={{ color: "#6b7280", fontSize: 14, lineHeight: 1.7 }}>Threats of violence or harm against any individual or group.</li>
              <li style={{ color: "#6b7280", fontSize: 14, lineHeight: 1.7 }}>Harassment, bullying, intimidation, or targeted abuse.</li>
              <li style={{ color: "#6b7280", fontSize: 14, lineHeight: 1.7 }}>Child sexual abuse material (CSAM) or any sexual content involving minors.</li>
              <li style={{ color: "#6b7280", fontSize: 14, lineHeight: 1.7 }}>Content that promotes or facilitates illegal activity.</li>
              <li style={{ color: "#6b7280", fontSize: 14, lineHeight: 1.7 }}>Spam, scams, phishing, or deceptive content.</li>
              <li style={{ color: "#6b7280", fontSize: 14, lineHeight: 1.7 }}>Personally identifiable information of others without their consent (doxxing).</li>
              <li style={{ color: "#6b7280", fontSize: 14, lineHeight: 1.7 }}>Content that incites hatred based on race, ethnicity, gender, religion, sexual orientation, disability, or other protected characteristics.</li>
            </ul>
          </section>

          <section>
            <h2 style={{ fontSize: 18, fontWeight: 600, color: "#1a1a2e", marginBottom: 12 }}>5. Account Termination</h2>
            <p style={{ color: "#4b5563", fontSize: 14, lineHeight: 1.7 }}>
              We reserve the right to suspend or terminate your account at any time, with or without notice, if we determine that you have violated these Terms of Service or our Content Policy. Upon termination, your right to use the service ceases immediately. We may also report illegal activity to law enforcement as required by applicable law.
            </p>
          </section>

          <section>
            <h2 style={{ fontSize: 18, fontWeight: 600, color: "#1a1a2e", marginBottom: 12 }}>6. Subscriptions and Billing</h2>
            <p style={{ color: "#4b5563", fontSize: 14, lineHeight: 1.7, marginBottom: 12 }}>WhatUPB offers optional paid subscription plans. By subscribing, you agree to the following:</p>
            <ul style={{ listStyle: "disc", paddingLeft: 20, display: "flex", flexDirection: "column", gap: 8 }}>
              <li style={{ color: "#6b7280", fontSize: 14, lineHeight: 1.7 }}>Subscriptions are billed on a recurring basis (monthly or annually, depending on the plan you choose).</li>
              <li style={{ color: "#6b7280", fontSize: 14, lineHeight: 1.7 }}>All payments are processed by Stripe. You agree to Stripe&apos;s terms when providing payment information.</li>
              <li style={{ color: "#6b7280", fontSize: 14, lineHeight: 1.7 }}>You may cancel your subscription at any time through your account settings. Cancellation takes effect at the end of the current billing period.</li>
              <li style={{ color: "#6b7280", fontSize: 14, lineHeight: 1.7 }}>We do not offer refunds for partial billing periods. If you cancel mid-cycle, you will retain access to paid features until the end of that billing period.</li>
              <li style={{ color: "#6b7280", fontSize: 14, lineHeight: 1.7 }}>We reserve the right to change pricing with 30 days notice. Continued use after a price change constitutes acceptance.</li>
            </ul>
          </section>

          <section>
            <h2 style={{ fontSize: 18, fontWeight: 600, color: "#1a1a2e", marginBottom: 12 }}>7. Limitation of Liability</h2>
            <p style={{ color: "#4b5563", fontSize: 14, lineHeight: 1.7 }}>
              To the maximum extent permitted by law, Aurora Bridge LLC and its officers, employees, and affiliates shall not be liable for any indirect, incidental, special, consequential, or punitive damages, including but not limited to loss of data, revenue, or profits, arising out of or related to your use of WhatUPB. Our total liability for any claim related to the service shall not exceed the amount you have paid us in the twelve (12) months preceding the claim.
            </p>
          </section>

          <section>
            <h2 style={{ fontSize: 18, fontWeight: 600, color: "#1a1a2e", marginBottom: 12 }}>8. Disclaimer</h2>
            <p style={{ color: "#4b5563", fontSize: 14, lineHeight: 1.7 }}>
              WhatUPB is provided &quot;as is&quot; and &quot;as available&quot; without warranties of any kind, either express or implied, including but not limited to implied warranties of merchantability, fitness for a particular purpose, and non-infringement. We do not guarantee that the service will be uninterrupted, secure, or error-free.
            </p>
          </section>

          <section>
            <h2 style={{ fontSize: 18, fontWeight: 600, color: "#1a1a2e", marginBottom: 12 }}>9. Indemnification</h2>
            <p style={{ color: "#4b5563", fontSize: 14, lineHeight: 1.7 }}>
              You agree to indemnify, defend, and hold harmless Aurora Bridge LLC and its officers, employees, and affiliates from any claims, damages, losses, liabilities, and expenses (including reasonable legal fees) arising from your use of the service, your violation of these Terms, or your violation of any third-party rights.
            </p>
          </section>

          <section>
            <h2 style={{ fontSize: 18, fontWeight: 600, color: "#1a1a2e", marginBottom: 12 }}>10. Governing Law</h2>
            <p style={{ color: "#4b5563", fontSize: 14, lineHeight: 1.7 }}>
              These Terms shall be governed by and construed in accordance with the laws of the United States. Any disputes arising under these Terms shall be resolved in the courts of competent jurisdiction.
            </p>
          </section>

          <section>
            <h2 style={{ fontSize: 18, fontWeight: 600, color: "#1a1a2e", marginBottom: 12 }}>11. Changes to These Terms</h2>
            <p style={{ color: "#4b5563", fontSize: 14, lineHeight: 1.7 }}>
              We may update these Terms of Service from time to time. If we make significant changes, we will notify you by email or through the service. Your continued use of WhatUPB after changes are posted constitutes acceptance of the updated terms.
            </p>
          </section>

          <section>
            <h2 style={{ fontSize: 18, fontWeight: 600, color: "#1a1a2e", marginBottom: 12 }}>12. Contact Us</h2>
            <p style={{ color: "#4b5563", fontSize: 14, lineHeight: 1.7 }}>
              If you have questions about these Terms of Service, contact Aurora Bridge LLC at{" "}
              <a href="mailto:contact.whatupb@gmail.com" style={{ color: "#8b5cf6", textDecoration: "underline" }}>contact.whatupb@gmail.com</a>.
            </p>
          </section>
        </div>

        {/* Footer nav */}
        <div style={{ marginTop: 64, paddingTop: 32, borderTop: "1px solid rgba(0,0,0,0.08)", display: "flex", flexWrap: "wrap", gap: "8px 24px", fontSize: 12 }}>
          <Link href="/privacy" style={{ color: "#9ca3af", textDecoration: "none" }}>Privacy Policy</Link>
          <Link href="/content-policy" style={{ color: "#9ca3af", textDecoration: "none" }}>Content Policy</Link>
          <Link href="/safety" style={{ color: "#9ca3af", textDecoration: "none" }}>Safety</Link>
          <Link href="/support" style={{ color: "#9ca3af", textDecoration: "none" }}>Support</Link>
          <Link href="/" style={{ color: "#9ca3af", textDecoration: "none" }}>Home</Link>
        </div>
      </div>
    </div>
  );
}

import Link from "next/link";

export const metadata = {
  title: "Privacy Policy — WhatUPB",
  description: "How WhatUPB collects, uses, and protects your data.",
};

export default function PrivacyPolicy() {
  return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(180deg, #fdfcfb 0%, #f5f2ed 100%)" }}>
      {/* Nav */}
      <nav style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "20px 32px", maxWidth: 900, margin: "0 auto" }}>
        <Link href="/" style={{ fontWeight: 700, fontSize: 20, color: "#1a1a2e", textDecoration: "none", fontFamily: "'Syne', sans-serif" }}>WhatUPB</Link>
        <div style={{ display: "flex", gap: 24, alignItems: "center", fontSize: 14 }}>
          <Link href="/terms" style={{ color: "#6b7280", textDecoration: "none", transition: "color 0.2s" }}>Terms</Link>
          <Link href="/safety" style={{ color: "#6b7280", textDecoration: "none", transition: "color 0.2s" }}>Safety</Link>
          <Link href="/support" style={{ color: "#6b7280", textDecoration: "none", transition: "color 0.2s" }}>Support</Link>
        </div>
      </nav>

      <div style={{ maxWidth: 720, margin: "0 auto", padding: "40px 24px 80px" }}>
        {/* Header */}
        <div style={{ marginBottom: 48 }}>
          <Link href="/" style={{ fontSize: 13, color: "#8b5cf6", textDecoration: "none", display: "inline-flex", alignItems: "center", gap: 4 }}>&larr; Back to WhatUPB</Link>
          <h1 style={{ fontSize: 32, fontWeight: 700, color: "#1a1a2e", marginTop: 20, letterSpacing: "-0.02em" }}>Privacy Policy</h1>
          <p style={{ color: "#9ca3af", fontSize: 13, marginTop: 8 }}>Effective date: March 8, 2026</p>
        </div>

        {/* Content */}
        <div style={{ display: "flex", flexDirection: "column", gap: 40 }}>
          <section>
            <p style={{ color: "#4b5563", fontSize: 14, lineHeight: 1.7 }}>
              WhatUPB is operated by Aurora Bridge LLC. This Privacy Policy explains what data we collect, how we use it, and your rights regarding that data. By using WhatUPB, you agree to the practices described below.
            </p>
          </section>

          <section>
            <h2 style={{ fontSize: 18, fontWeight: 600, color: "#1a1a2e", marginBottom: 12 }}>1. Information We Collect</h2>
            <p style={{ color: "#4b5563", fontSize: 14, lineHeight: 1.7, marginBottom: 12 }}>We collect the following information when you use WhatUPB:</p>
            <ul style={{ listStyle: "disc", paddingLeft: 20, display: "flex", flexDirection: "column", gap: 8 }}>
              <li style={{ color: "#6b7280", fontSize: 14, lineHeight: 1.7 }}><strong style={{ color: "#4b5563" }}>Account information:</strong> your email address and username when you create an account.</li>
              <li style={{ color: "#6b7280", fontSize: 14, lineHeight: 1.7 }}><strong style={{ color: "#4b5563" }}>Messages:</strong> anonymous messages sent to and from your profile. Messages sent anonymously cannot be traced back to the sender.</li>
              <li style={{ color: "#6b7280", fontSize: 14, lineHeight: 1.7 }}><strong style={{ color: "#4b5563" }}>Hashed IP addresses:</strong> we store one-way hashes of IP addresses for spam and abuse prevention. We do NOT store raw IP addresses.</li>
              <li style={{ color: "#6b7280", fontSize: 14, lineHeight: 1.7 }}><strong style={{ color: "#4b5563" }}>Payment information:</strong> if you subscribe to a paid plan, payment is processed entirely by Stripe. We do not store your credit card number, bank account details, or any sensitive financial information on our servers.</li>
              <li style={{ color: "#6b7280", fontSize: 14, lineHeight: 1.7 }}><strong style={{ color: "#4b5563" }}>Age verification:</strong> we record that you confirmed you are 18 or older. We do not store your date of birth.</li>
            </ul>
          </section>

          <section>
            <h2 style={{ fontSize: 18, fontWeight: 600, color: "#1a1a2e", marginBottom: 12 }}>2. How We Use Your Information</h2>
            <ul style={{ listStyle: "disc", paddingLeft: 20, display: "flex", flexDirection: "column", gap: 8 }}>
              <li style={{ color: "#6b7280", fontSize: 14, lineHeight: 1.7 }}>To provide and maintain the WhatUPB service.</li>
              <li style={{ color: "#6b7280", fontSize: 14, lineHeight: 1.7 }}>To prevent abuse and spam using hashed IP addresses and automated content moderation.</li>
              <li style={{ color: "#6b7280", fontSize: 14, lineHeight: 1.7 }}>To process payments and manage subscriptions via Stripe.</li>
              <li style={{ color: "#6b7280", fontSize: 14, lineHeight: 1.7 }}>To send important account-related emails (e.g., email confirmation, security alerts).</li>
              <li style={{ color: "#6b7280", fontSize: 14, lineHeight: 1.7 }}>To enforce our Terms of Service and Content Policy.</li>
            </ul>
          </section>

          <section>
            <h2 style={{ fontSize: 18, fontWeight: 600, color: "#1a1a2e", marginBottom: 12 }}>3. Anonymity of Messages</h2>
            <p style={{ color: "#4b5563", fontSize: 14, lineHeight: 1.7 }}>
              Messages sent through WhatUPB are anonymous. We do not store sender identity information with messages. Recipients cannot see who sent them a message, and we cannot trace anonymous messages back to the sender.
            </p>
          </section>

          <section>
            <h2 style={{ fontSize: 18, fontWeight: 600, color: "#1a1a2e", marginBottom: 12 }}>4. Automated Content Moderation</h2>
            <p style={{ color: "#4b5563", fontSize: 14, lineHeight: 1.7 }}>
              We use the Google Perspective API to automatically analyze messages for toxic, threatening, or abusive content. This processing happens in real time when a message is submitted. Messages that exceed our toxicity thresholds may be blocked automatically. No human reviews your messages.
            </p>
          </section>

          <section>
            <h2 style={{ fontSize: 18, fontWeight: 600, color: "#1a1a2e", marginBottom: 12 }}>5. Payment Processing</h2>
            <p style={{ color: "#4b5563", fontSize: 14, lineHeight: 1.7 }}>
              All payment processing is handled by Stripe. When you subscribe to a paid plan, your payment information is collected and processed directly by Stripe in accordance with their{" "}
              <a href="https://stripe.com/privacy" target="_blank" rel="noopener noreferrer" style={{ color: "#8b5cf6", textDecoration: "underline" }}>Privacy Policy</a>.
              We receive only limited information from Stripe, such as subscription status and the last four digits of your card, to display in your account settings.
            </p>
          </section>

          <section>
            <h2 style={{ fontSize: 18, fontWeight: 600, color: "#1a1a2e", marginBottom: 12 }}>6. Third-Party Services</h2>
            <p style={{ color: "#4b5563", fontSize: 14, lineHeight: 1.7, marginBottom: 12 }}>We use the following third-party services to operate WhatUPB:</p>
            <ul style={{ listStyle: "disc", paddingLeft: 20, display: "flex", flexDirection: "column", gap: 8 }}>
              <li style={{ color: "#6b7280", fontSize: 14, lineHeight: 1.7 }}><strong style={{ color: "#4b5563" }}>Stripe</strong> &mdash; payment processing (<a href="https://stripe.com/privacy" target="_blank" rel="noopener noreferrer" style={{ color: "#8b5cf6", textDecoration: "underline" }}>stripe.com/privacy</a>)</li>
              <li style={{ color: "#6b7280", fontSize: 14, lineHeight: 1.7 }}><strong style={{ color: "#4b5563" }}>Google Perspective API</strong> &mdash; automated content moderation</li>
              <li style={{ color: "#6b7280", fontSize: 14, lineHeight: 1.7 }}><strong style={{ color: "#4b5563" }}>Supabase</strong> &mdash; authentication and database</li>
              <li style={{ color: "#6b7280", fontSize: 14, lineHeight: 1.7 }}><strong style={{ color: "#4b5563" }}>PostHog</strong> &mdash; product analytics (<a href="https://posthog.com/privacy" target="_blank" rel="noopener noreferrer" style={{ color: "#8b5cf6", textDecoration: "underline" }}>posthog.com/privacy</a>)</li>
              <li style={{ color: "#6b7280", fontSize: 14, lineHeight: 1.7 }}><strong style={{ color: "#4b5563" }}>Sentry</strong> &mdash; error monitoring and performance tracking (<a href="https://sentry.io/privacy/" target="_blank" rel="noopener noreferrer" style={{ color: "#8b5cf6", textDecoration: "underline" }}>sentry.io/privacy</a>)</li>
            </ul>
          </section>

          <section>
            <h2 style={{ fontSize: 18, fontWeight: 600, color: "#1a1a2e", marginBottom: 12 }}>7. Cookies and Authentication</h2>
            <p style={{ color: "#4b5563", fontSize: 14, lineHeight: 1.7 }}>
              We use Supabase for authentication. Cookies are used solely to maintain your login session and are essential for the service to function. We do not use tracking cookies or third-party advertising cookies.
            </p>
          </section>

          <section>
            <h2 style={{ fontSize: 18, fontWeight: 600, color: "#1a1a2e", marginBottom: 12 }}>8. Data Retention</h2>
            <p style={{ color: "#4b5563", fontSize: 14, lineHeight: 1.7 }}>
              We retain your account information and messages for as long as your account is active. If you delete your account, we will delete your personal data within 30 days, except where we are required to retain it for legal or security purposes (e.g., hashed IP data used for abuse prevention).
            </p>
          </section>

          <section>
            <h2 style={{ fontSize: 18, fontWeight: 600, color: "#1a1a2e", marginBottom: 12 }}>9. Your Rights</h2>
            <p style={{ color: "#4b5563", fontSize: 14, lineHeight: 1.7, marginBottom: 12 }}>You have the right to:</p>
            <ul style={{ listStyle: "disc", paddingLeft: 20, display: "flex", flexDirection: "column", gap: 8 }}>
              <li style={{ color: "#6b7280", fontSize: 14, lineHeight: 1.7 }}>Access the personal data we hold about you.</li>
              <li style={{ color: "#6b7280", fontSize: 14, lineHeight: 1.7 }}>Request correction of inaccurate data.</li>
              <li style={{ color: "#6b7280", fontSize: 14, lineHeight: 1.7 }}>Request deletion of your account and associated data.</li>
              <li style={{ color: "#6b7280", fontSize: 14, lineHeight: 1.7 }}>Opt out of non-essential data collection (note: we do not currently engage in non-essential data collection).</li>
            </ul>
            <p style={{ color: "#4b5563", fontSize: 14, lineHeight: 1.7, marginTop: 12 }}>
              To exercise any of these rights, contact us at{" "}
              <a href="mailto:contact.whatupb@gmail.com" style={{ color: "#8b5cf6", textDecoration: "underline" }}>contact.whatupb@gmail.com</a>.
            </p>
          </section>

          <section>
            <h2 style={{ fontSize: 18, fontWeight: 600, color: "#1a1a2e", marginBottom: 12 }}>10. CCPA (California Residents)</h2>
            <p style={{ color: "#4b5563", fontSize: 14, lineHeight: 1.7 }}>
              If you are a California resident, the California Consumer Privacy Act (CCPA) grants you the right to know what personal information we collect, request its deletion, and opt out of its sale. We do not sell your personal information. To submit a request, email us at{" "}
              <a href="mailto:contact.whatupb@gmail.com" style={{ color: "#8b5cf6", textDecoration: "underline" }}>contact.whatupb@gmail.com</a>.
            </p>
          </section>

          <section>
            <h2 style={{ fontSize: 18, fontWeight: 600, color: "#1a1a2e", marginBottom: 12 }}>11. GDPR (European Residents)</h2>
            <p style={{ color: "#4b5563", fontSize: 14, lineHeight: 1.7 }}>
              If you are located in the European Economic Area, you have rights under the General Data Protection Regulation (GDPR) including the right to access, rectify, erase, restrict, and port your data. Our legal basis for processing your data is the performance of our contract with you (providing the service) and our legitimate interest in preventing abuse. To exercise your GDPR rights, contact us at{" "}
              <a href="mailto:contact.whatupb@gmail.com" style={{ color: "#8b5cf6", textDecoration: "underline" }}>contact.whatupb@gmail.com</a>.
            </p>
          </section>

          <section>
            <h2 style={{ fontSize: 18, fontWeight: 600, color: "#1a1a2e", marginBottom: 12 }}>12. Changes to This Policy</h2>
            <p style={{ color: "#4b5563", fontSize: 14, lineHeight: 1.7 }}>
              We may update this Privacy Policy from time to time. If we make significant changes, we will notify you by email or through the service. Your continued use of WhatUPB after changes are posted constitutes acceptance of the updated policy.
            </p>
          </section>

          <section>
            <h2 style={{ fontSize: 18, fontWeight: 600, color: "#1a1a2e", marginBottom: 12 }}>13. Contact Us</h2>
            <p style={{ color: "#4b5563", fontSize: 14, lineHeight: 1.7 }}>
              If you have questions about this Privacy Policy, contact Aurora Bridge LLC at{" "}
              <a href="mailto:contact.whatupb@gmail.com" style={{ color: "#8b5cf6", textDecoration: "underline" }}>contact.whatupb@gmail.com</a>.
            </p>
          </section>
        </div>

        {/* Footer nav */}
        <div style={{ marginTop: 64, paddingTop: 32, borderTop: "1px solid rgba(0,0,0,0.08)", display: "flex", flexWrap: "wrap", gap: "8px 24px", fontSize: 12 }}>
          <Link href="/terms" style={{ color: "#9ca3af", textDecoration: "none" }}>Terms of Service</Link>
          <Link href="/content-policy" style={{ color: "#9ca3af", textDecoration: "none" }}>Content Policy</Link>
          <Link href="/safety" style={{ color: "#9ca3af", textDecoration: "none" }}>Safety</Link>
          <Link href="/support" style={{ color: "#9ca3af", textDecoration: "none" }}>Support</Link>
          <Link href="/" style={{ color: "#9ca3af", textDecoration: "none" }}>Home</Link>
        </div>
      </div>
    </div>
  );
}

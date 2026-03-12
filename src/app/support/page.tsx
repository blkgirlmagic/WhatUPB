import Link from "next/link";

export const metadata = {
  title: "Support — WhatUPB",
  description:
    "Get help with your WhatUPB account, subscription, or platform questions.",
};

export default function Support() {
  return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(180deg, #fdfcfb 0%, #f5f2ed 100%)" }}>
      {/* Nav */}
      <nav style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "20px 32px", maxWidth: 900, margin: "0 auto" }}>
        <Link href="/" style={{ fontWeight: 700, fontSize: 20, color: "#1a1a2e", textDecoration: "none", fontFamily: "'Syne', sans-serif" }}>WhatUPB</Link>
        <div style={{ display: "flex", gap: 24, alignItems: "center", fontSize: 14 }}>
          <Link href="/privacy" style={{ color: "#6b7280", textDecoration: "none" }}>Privacy</Link>
          <Link href="/terms" style={{ color: "#6b7280", textDecoration: "none" }}>Terms</Link>
          <Link href="/safety" style={{ color: "#6b7280", textDecoration: "none" }}>Safety</Link>
        </div>
      </nav>

      <div style={{ maxWidth: 720, margin: "0 auto", padding: "40px 24px 80px" }}>
        {/* Header */}
        <div style={{ marginBottom: 48 }}>
          <Link href="/" style={{ fontSize: 13, color: "#8b5cf6", textDecoration: "none", display: "inline-flex", alignItems: "center", gap: 4 }}>&larr; Back to WhatUPB</Link>
          <h1 style={{ fontSize: 32, fontWeight: 700, color: "#1a1a2e", marginTop: 20, letterSpacing: "-0.02em" }}>Support</h1>
          <p style={{ color: "#9ca3af", fontSize: 13, marginTop: 8 }}>Last updated: March 2026</p>
        </div>

        {/* Content */}
        <div style={{ display: "flex", flexDirection: "column", gap: 40 }}>
          <section>
            <p style={{ color: "#4b5563", fontSize: 14, lineHeight: 1.7 }}>
              Welcome to the WhatUPB Support Center. If you need help with your account, subscription, or have questions about using the platform, please contact our support team.
            </p>
          </section>

          <section>
            <h2 style={{ fontSize: 18, fontWeight: 600, color: "#1a1a2e", marginBottom: 12 }}>Contact Support</h2>
            <p style={{ color: "#4b5563", fontSize: 14, lineHeight: 1.7, marginBottom: 12 }}>Email support is the fastest way to reach us.</p>
            <ul style={{ listStyle: "disc", paddingLeft: 20, display: "flex", flexDirection: "column", gap: 8 }}>
              <li style={{ color: "#6b7280", fontSize: 14, lineHeight: 1.7 }}><strong style={{ color: "#4b5563" }}>Email:</strong>{" "}<a href="mailto:contact.whatupb@gmail.com" style={{ color: "#8b5cf6", textDecoration: "underline" }}>contact.whatupb@gmail.com</a></li>
            </ul>
            <p style={{ color: "#4b5563", fontSize: 14, lineHeight: 1.7, marginTop: 16 }}>We typically respond within 24&ndash;48 hours.</p>
          </section>

          <section>
            <h2 style={{ fontSize: 18, fontWeight: 600, color: "#1a1a2e", marginBottom: 12 }}>Common Questions</h2>
            <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
              <div>
                <p style={{ color: "#1a1a2e", fontSize: 14, fontWeight: 600, marginBottom: 4 }}>How do I delete my account?</p>
                <p style={{ color: "#6b7280", fontSize: 14, lineHeight: 1.7 }}>Email us at <a href="mailto:contact.whatupb@gmail.com" style={{ color: "#8b5cf6", textDecoration: "underline" }}>contact.whatupb@gmail.com</a> with the subject &quot;Account Deletion&quot; and we&apos;ll process it within 30 days.</p>
              </div>
              <div>
                <p style={{ color: "#1a1a2e", fontSize: 14, fontWeight: 600, marginBottom: 4 }}>How do I cancel my subscription?</p>
                <p style={{ color: "#6b7280", fontSize: 14, lineHeight: 1.7 }}>Go to Settings &gt; Billing to manage your subscription. Cancellation takes effect at the end of your current billing period.</p>
              </div>
              <div>
                <p style={{ color: "#1a1a2e", fontSize: 14, fontWeight: 600, marginBottom: 4 }}>I received a harmful message. What do I do?</p>
                <p style={{ color: "#6b7280", fontSize: 14, lineHeight: 1.7 }}>Report it by emailing <a href="mailto:contact.whatupb@gmail.com" style={{ color: "#8b5cf6", textDecoration: "underline" }}>contact.whatupb@gmail.com</a>. If you&apos;re in crisis, visit our <Link href="/safety" style={{ color: "#8b5cf6", textDecoration: "underline" }}>Safety Resources</Link> page.</p>
              </div>
            </div>
          </section>

          <section>
            <h2 style={{ fontSize: 18, fontWeight: 600, color: "#1a1a2e", marginBottom: 12 }}>Report Abuse</h2>
            <p style={{ color: "#4b5563", fontSize: 14, lineHeight: 1.7 }}>
              If you need to report abuse, harassment, or illegal content on the platform, email us with as much context as possible. We take all reports seriously.
            </p>
          </section>
        </div>

        {/* Footer nav */}
        <div style={{ marginTop: 64, paddingTop: 32, borderTop: "1px solid rgba(0,0,0,0.08)", display: "flex", flexWrap: "wrap", gap: "8px 24px", fontSize: 12 }}>
          <Link href="/privacy" style={{ color: "#9ca3af", textDecoration: "none" }}>Privacy Policy</Link>
          <Link href="/terms" style={{ color: "#9ca3af", textDecoration: "none" }}>Terms of Service</Link>
          <Link href="/content-policy" style={{ color: "#9ca3af", textDecoration: "none" }}>Content Policy</Link>
          <Link href="/safety" style={{ color: "#9ca3af", textDecoration: "none" }}>Safety</Link>
          <Link href="/" style={{ color: "#9ca3af", textDecoration: "none" }}>Home</Link>
        </div>
      </div>
    </div>
  );
}

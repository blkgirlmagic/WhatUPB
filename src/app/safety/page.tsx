import Link from "next/link";

export const metadata = {
  title: "Safety Resources — WhatUPB",
  description:
    "Mental health and crisis resources. If you or someone you know is in danger, please reach out.",
};

export default function Safety() {
  return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(180deg, #fdfcfb 0%, #f5f2ed 100%)" }}>
      {/* Nav */}
      <nav style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "20px 32px", maxWidth: 900, margin: "0 auto" }}>
        <Link href="/" style={{ fontWeight: 700, fontSize: 20, color: "#1a1a2e", textDecoration: "none", fontFamily: "'Playfair Display', serif" }}>WhatUPB</Link>
        <div style={{ display: "flex", gap: 24, alignItems: "center", fontSize: 14 }}>
          <Link href="/privacy" style={{ color: "#6b7280", textDecoration: "none" }}>Privacy</Link>
          <Link href="/terms" style={{ color: "#6b7280", textDecoration: "none" }}>Terms</Link>
          <Link href="/support" style={{ color: "#6b7280", textDecoration: "none" }}>Support</Link>
        </div>
      </nav>

      <div style={{ maxWidth: 720, margin: "0 auto", padding: "40px 24px 80px" }}>
        {/* Header */}
        <div style={{ marginBottom: 48 }}>
          <Link href="/" style={{ fontSize: 13, color: "#8b5cf6", textDecoration: "none", display: "inline-flex", alignItems: "center", gap: 4 }}>&larr; Back to WhatUPB</Link>
          <h1 style={{ fontSize: 32, fontWeight: 700, color: "#1a1a2e", marginTop: 20, letterSpacing: "-0.02em" }}>Safety Resources</h1>
          <p style={{ color: "#9ca3af", fontSize: 13, marginTop: 8 }}>If you or someone you know is struggling, help is available 24/7.</p>
        </div>

        {/* Content */}
        <div style={{ display: "flex", flexDirection: "column", gap: 40 }}>
          <section>
            <p style={{ color: "#4b5563", fontSize: 14, lineHeight: 1.7 }}>
              Anonymous platforms can surface difficult emotions. Whether you&apos;ve received a hurtful message or are going through a tough time, you are not alone. The resources below are free, confidential, and available around the clock.
            </p>
          </section>

          <section>
            <h2 style={{ fontSize: 18, fontWeight: 600, color: "#1a1a2e", marginBottom: 12 }}>988 Suicide &amp; Crisis Lifeline</h2>
            <p style={{ color: "#4b5563", fontSize: 14, lineHeight: 1.7, marginBottom: 12 }}>Free, confidential support for people in distress. Available 24/7 by phone, chat, or text.</p>
            <ul style={{ listStyle: "disc", paddingLeft: 20, display: "flex", flexDirection: "column", gap: 8 }}>
              <li style={{ color: "#6b7280", fontSize: 14, lineHeight: 1.7 }}><strong style={{ color: "#4b5563" }}>Call or text:</strong>{" "}<a href="tel:988" style={{ color: "#8b5cf6", textDecoration: "underline" }}>988</a></li>
              <li style={{ color: "#6b7280", fontSize: 14, lineHeight: 1.7 }}><strong style={{ color: "#4b5563" }}>Chat online:</strong>{" "}<a href="https://988lifeline.org/chat" target="_blank" rel="noopener noreferrer" style={{ color: "#8b5cf6", textDecoration: "underline" }}>988lifeline.org/chat</a></li>
            </ul>
          </section>

          <section>
            <h2 style={{ fontSize: 18, fontWeight: 600, color: "#1a1a2e", marginBottom: 12 }}>Crisis Text Line</h2>
            <p style={{ color: "#4b5563", fontSize: 14, lineHeight: 1.7, marginBottom: 12 }}>Free, 24/7 crisis support via text message. Trained crisis counselors are ready to help.</p>
            <ul style={{ listStyle: "disc", paddingLeft: 20, display: "flex", flexDirection: "column", gap: 8 }}>
              <li style={{ color: "#6b7280", fontSize: 14, lineHeight: 1.7 }}><strong style={{ color: "#4b5563" }}>Text:</strong> <strong style={{ color: "#1a1a2e" }}>HELLO</strong> to{" "}<a href="sms:741741&body=HELLO" style={{ color: "#8b5cf6", textDecoration: "underline" }}>741741</a></li>
              <li style={{ color: "#6b7280", fontSize: 14, lineHeight: 1.7 }}><strong style={{ color: "#4b5563" }}>Learn more:</strong>{" "}<a href="https://www.crisistextline.org" target="_blank" rel="noopener noreferrer" style={{ color: "#8b5cf6", textDecoration: "underline" }}>crisistextline.org</a></li>
            </ul>
          </section>

          <section>
            <h2 style={{ fontSize: 18, fontWeight: 600, color: "#1a1a2e", marginBottom: 12 }}>RAINN (Rape, Abuse &amp; Incest National Network)</h2>
            <p style={{ color: "#4b5563", fontSize: 14, lineHeight: 1.7, marginBottom: 12 }}>The nation&apos;s largest anti-sexual-violence organization. Confidential support from trained staff members.</p>
            <ul style={{ listStyle: "disc", paddingLeft: 20, display: "flex", flexDirection: "column", gap: 8 }}>
              <li style={{ color: "#6b7280", fontSize: 14, lineHeight: 1.7 }}><strong style={{ color: "#4b5563" }}>Hotline:</strong>{" "}<a href="tel:1-800-656-4673" style={{ color: "#8b5cf6", textDecoration: "underline" }}>1-800-656-HOPE (4673)</a></li>
              <li style={{ color: "#6b7280", fontSize: 14, lineHeight: 1.7 }}><strong style={{ color: "#4b5563" }}>Online chat:</strong>{" "}<a href="https://www.rainn.org/get-help" target="_blank" rel="noopener noreferrer" style={{ color: "#8b5cf6", textDecoration: "underline" }}>rainn.org/get-help</a></li>
            </ul>
          </section>

          <section>
            <h2 style={{ fontSize: 18, fontWeight: 600, color: "#1a1a2e", marginBottom: 12 }}>Contact WhatUPB Support</h2>
            <p style={{ color: "#4b5563", fontSize: 14, lineHeight: 1.7, marginBottom: 12 }}>If you&apos;ve received a message that made you feel unsafe, or if you need to report abuse on the platform, our team is here to help.</p>
            <ul style={{ listStyle: "disc", paddingLeft: 20, display: "flex", flexDirection: "column", gap: 8 }}>
              <li style={{ color: "#6b7280", fontSize: 14, lineHeight: 1.7 }}><strong style={{ color: "#4b5563" }}>Email:</strong>{" "}<a href="mailto:contact.whatupb@gmail.com" style={{ color: "#8b5cf6", textDecoration: "underline" }}>contact.whatupb@gmail.com</a></li>
            </ul>
          </section>

          <section>
            <p style={{ color: "#6b7280", fontSize: 14, fontStyle: "italic", lineHeight: 1.7 }}>
              You matter. Reaching out is a sign of strength, not weakness.
            </p>
          </section>
        </div>

        {/* Footer nav */}
        <div style={{ marginTop: 64, paddingTop: 32, borderTop: "1px solid rgba(0,0,0,0.08)", display: "flex", flexWrap: "wrap", gap: "8px 24px", fontSize: 12 }}>
          <Link href="/privacy" style={{ color: "#9ca3af", textDecoration: "none" }}>Privacy Policy</Link>
          <Link href="/terms" style={{ color: "#9ca3af", textDecoration: "none" }}>Terms of Service</Link>
          <Link href="/content-policy" style={{ color: "#9ca3af", textDecoration: "none" }}>Content Policy</Link>
          <Link href="/support" style={{ color: "#9ca3af", textDecoration: "none" }}>Support</Link>
          <Link href="/" style={{ color: "#9ca3af", textDecoration: "none" }}>Home</Link>
        </div>
      </div>
    </div>
  );
}

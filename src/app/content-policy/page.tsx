import Link from "next/link";

export const metadata = {
  title: "Content Policy — WhatUPB",
  description: "What is and isn't allowed on WhatUPB.",
};

export default function ContentPolicy() {
  return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(180deg, #fdfcfb 0%, #f5f2ed 100%)" }}>
      {/* Nav */}
      <nav style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "20px 32px", maxWidth: 900, margin: "0 auto" }}>
        <Link href="/" style={{ fontWeight: 700, fontSize: 20, color: "#1a1a2e", textDecoration: "none", fontFamily: "'Playfair Display', serif" }}>WhatUPB</Link>
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
          <h1 style={{ fontSize: 32, fontWeight: 700, color: "#1a1a2e", marginTop: 20, letterSpacing: "-0.02em" }}>Content Policy</h1>
          <p style={{ color: "#9ca3af", fontSize: 13, marginTop: 8 }}>Effective date: March 8, 2026</p>
        </div>

        {/* Content */}
        <div style={{ display: "flex", flexDirection: "column", gap: 40 }}>
          <section>
            <p style={{ color: "#4b5563", fontSize: 14, lineHeight: 1.7 }}>
              WhatUPB is built for honest, anonymous conversations. To keep the platform safe for everyone, all users must follow this Content Policy. This applies to all messages sent through WhatUPB, whether anonymous or not.
            </p>
          </section>

          <section>
            <h2 style={{ fontSize: 18, fontWeight: 600, color: "#1a1a2e", marginBottom: 12 }}>1. What&apos;s Allowed</h2>
            <p style={{ color: "#4b5563", fontSize: 14, lineHeight: 1.7, marginBottom: 12 }}>WhatUPB encourages open, honest communication. You are welcome to:</p>
            <ul style={{ listStyle: "disc", paddingLeft: 20, display: "flex", flexDirection: "column", gap: 8 }}>
              <li style={{ color: "#6b7280", fontSize: 14, lineHeight: 1.7 }}>Send honest feedback, opinions, compliments, or questions.</li>
              <li style={{ color: "#6b7280", fontSize: 14, lineHeight: 1.7 }}>Have candid conversations anonymously.</li>
              <li style={{ color: "#6b7280", fontSize: 14, lineHeight: 1.7 }}>Share thoughts you might not feel comfortable saying in person.</li>
              <li style={{ color: "#6b7280", fontSize: 14, lineHeight: 1.7 }}>Use creative, casual, or informal language.</li>
            </ul>
            <p style={{ color: "#4b5563", fontSize: 14, lineHeight: 1.7, marginTop: 12 }}>Honesty is encouraged. Cruelty is not.</p>
          </section>

          <section>
            <h2 style={{ fontSize: 18, fontWeight: 600, color: "#1a1a2e", marginBottom: 12 }}>2. What&apos;s Not Allowed</h2>
            <p style={{ color: "#4b5563", fontSize: 14, lineHeight: 1.7, marginBottom: 12 }}>The following content is strictly prohibited on WhatUPB:</p>
            <ul style={{ listStyle: "disc", paddingLeft: 20, display: "flex", flexDirection: "column", gap: 8 }}>
              <li style={{ color: "#6b7280", fontSize: 14, lineHeight: 1.7 }}><strong style={{ color: "#4b5563" }}>Threats:</strong> any message threatening violence, harm, or death against any person or group.</li>
              <li style={{ color: "#6b7280", fontSize: 14, lineHeight: 1.7 }}><strong style={{ color: "#4b5563" }}>Harassment:</strong> targeted bullying, intimidation, repeated unwanted contact, or messages intended to cause emotional distress.</li>
              <li style={{ color: "#6b7280", fontSize: 14, lineHeight: 1.7 }}><strong style={{ color: "#4b5563" }}>Hate speech:</strong> content that attacks or demeans people based on race, ethnicity, gender, religion, sexual orientation, disability, or other protected characteristics.</li>
              <li style={{ color: "#6b7280", fontSize: 14, lineHeight: 1.7 }}><strong style={{ color: "#4b5563" }}>Child sexual abuse material (CSAM):</strong> any sexual content involving minors. This is reported to authorities immediately.</li>
              <li style={{ color: "#6b7280", fontSize: 14, lineHeight: 1.7 }}><strong style={{ color: "#4b5563" }}>Illegal activity:</strong> content that promotes, facilitates, or solicits illegal activity.</li>
              <li style={{ color: "#6b7280", fontSize: 14, lineHeight: 1.7 }}><strong style={{ color: "#4b5563" }}>Doxxing:</strong> sharing someone&apos;s personal information (address, phone number, real name, etc.) without their consent.</li>
              <li style={{ color: "#6b7280", fontSize: 14, lineHeight: 1.7 }}><strong style={{ color: "#4b5563" }}>Spam and scams:</strong> unsolicited promotional content, phishing links, or deceptive messages.</li>
              <li style={{ color: "#6b7280", fontSize: 14, lineHeight: 1.7 }}><strong style={{ color: "#4b5563" }}>Self-harm or suicide encouragement:</strong> content that encourages or glorifies self-harm or suicide.</li>
            </ul>
          </section>

          <section>
            <h2 style={{ fontSize: 18, fontWeight: 600, color: "#1a1a2e", marginBottom: 12 }}>3. Automated Moderation</h2>
            <p style={{ color: "#4b5563", fontSize: 14, lineHeight: 1.7, marginBottom: 12 }}>WhatUPB uses the Google Perspective API to automatically screen messages for toxic, threatening, or abusive content in real time. Here&apos;s how it works:</p>
            <ul style={{ listStyle: "disc", paddingLeft: 20, display: "flex", flexDirection: "column", gap: 8 }}>
              <li style={{ color: "#6b7280", fontSize: 14, lineHeight: 1.7 }}>Every message is analyzed before delivery for toxicity, threats, insults, and other harmful signals.</li>
              <li style={{ color: "#6b7280", fontSize: 14, lineHeight: 1.7 }}>Messages that exceed our toxicity thresholds are blocked automatically and never delivered to the recipient.</li>
              <li style={{ color: "#6b7280", fontSize: 14, lineHeight: 1.7 }}>No human reviews your messages. Moderation is fully automated.</li>
              <li style={{ color: "#6b7280", fontSize: 14, lineHeight: 1.7 }}>Automated systems are not perfect. Some harmful content may slip through, and some legitimate messages may occasionally be flagged. If you believe a message was blocked unfairly, contact us.</li>
            </ul>
          </section>

          <section>
            <h2 style={{ fontSize: 18, fontWeight: 600, color: "#1a1a2e", marginBottom: 12 }}>4. Reporting Abuse</h2>
            <p style={{ color: "#4b5563", fontSize: 14, lineHeight: 1.7, marginBottom: 12 }}>If you receive a message that violates this Content Policy or makes you feel unsafe, you can report it:</p>
            <ul style={{ listStyle: "disc", paddingLeft: 20, display: "flex", flexDirection: "column", gap: 8 }}>
              <li style={{ color: "#6b7280", fontSize: 14, lineHeight: 1.7 }}>Email us at <a href="mailto:contact.whatupb@gmail.com" style={{ color: "#8b5cf6", textDecoration: "underline" }}>contact.whatupb@gmail.com</a> with a description of the issue.</li>
              <li style={{ color: "#6b7280", fontSize: 14, lineHeight: 1.7 }}>Include as much context as possible (e.g., screenshot of the message, your username, approximate time received).</li>
              <li style={{ color: "#6b7280", fontSize: 14, lineHeight: 1.7 }}>We take all reports seriously and will investigate promptly.</li>
            </ul>
          </section>

          <section>
            <h2 style={{ fontSize: 18, fontWeight: 600, color: "#1a1a2e", marginBottom: 12 }}>5. Consequences for Violations</h2>
            <p style={{ color: "#4b5563", fontSize: 14, lineHeight: 1.7, marginBottom: 12 }}>If we determine that a user has violated this Content Policy, we may take any of the following actions:</p>
            <ul style={{ listStyle: "disc", paddingLeft: 20, display: "flex", flexDirection: "column", gap: 8 }}>
              <li style={{ color: "#6b7280", fontSize: 14, lineHeight: 1.7 }}><strong style={{ color: "#4b5563" }}>Message blocking:</strong> individual messages that violate the policy are blocked automatically and not delivered.</li>
              <li style={{ color: "#6b7280", fontSize: 14, lineHeight: 1.7 }}><strong style={{ color: "#4b5563" }}>Account suspension:</strong> temporary suspension of account access for repeated or serious violations.</li>
              <li style={{ color: "#6b7280", fontSize: 14, lineHeight: 1.7 }}><strong style={{ color: "#4b5563" }}>Account termination:</strong> permanent deletion of the account for severe or repeated violations.</li>
              <li style={{ color: "#6b7280", fontSize: 14, lineHeight: 1.7 }}><strong style={{ color: "#4b5563" }}>Legal referral:</strong> illegal activity, including CSAM and credible threats of violence, will be reported to law enforcement.</li>
            </ul>
            <p style={{ color: "#4b5563", fontSize: 14, lineHeight: 1.7, marginTop: 12 }}>Enforcement decisions are made at our sole discretion and are final.</p>
          </section>

          <section>
            <h2 style={{ fontSize: 18, fontWeight: 600, color: "#1a1a2e", marginBottom: 12 }}>6. Changes to This Policy</h2>
            <p style={{ color: "#4b5563", fontSize: 14, lineHeight: 1.7 }}>
              We may update this Content Policy as the platform evolves. If we make significant changes, we will notify users through the service. Continued use of WhatUPB after changes are posted constitutes acceptance of the updated policy.
            </p>
          </section>

          <section>
            <h2 style={{ fontSize: 18, fontWeight: 600, color: "#1a1a2e", marginBottom: 12 }}>7. Contact Us</h2>
            <p style={{ color: "#4b5563", fontSize: 14, lineHeight: 1.7 }}>
              If you have questions about this Content Policy or need to report a concern, contact Aurora Bridge LLC at{" "}
              <a href="mailto:contact.whatupb@gmail.com" style={{ color: "#8b5cf6", textDecoration: "underline" }}>contact.whatupb@gmail.com</a>.
            </p>
          </section>
        </div>

        {/* Footer nav */}
        <div style={{ marginTop: 64, paddingTop: 32, borderTop: "1px solid rgba(0,0,0,0.08)", display: "flex", flexWrap: "wrap", gap: "8px 24px", fontSize: 12 }}>
          <Link href="/privacy" style={{ color: "#9ca3af", textDecoration: "none" }}>Privacy Policy</Link>
          <Link href="/terms" style={{ color: "#9ca3af", textDecoration: "none" }}>Terms of Service</Link>
          <Link href="/safety" style={{ color: "#9ca3af", textDecoration: "none" }}>Safety</Link>
          <Link href="/support" style={{ color: "#9ca3af", textDecoration: "none" }}>Support</Link>
          <Link href="/" style={{ color: "#9ca3af", textDecoration: "none" }}>Home</Link>
        </div>
      </div>
    </div>
  );
}

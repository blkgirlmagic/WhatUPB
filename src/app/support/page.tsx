import Link from "next/link";
import MainNav from "@/components/main-nav";
import { DiagonalLines } from "@/components/diagonal-lines";

export const metadata = {
  title: "Support | WhatUPB",
  description:
    "Get help with WhatUPB Intelligence Briefs, the WhatUPB Brief newsletter, billing, corrections, and technical issues.",
};

export default function SupportPage() {
  return (
    <div className="wb-page">
      <div className="bloom" />
      <DiagonalLines />
      <MainNav />

      <div className="wb-support-wrap">
        <div className="wb-support-inner">

          {/* Back link */}
          <Link href="/" className="wb-intel-bc-link">← Back to WhatUPB</Link>

          {/* Header */}
          <div className="wb-support-header">
            <div className="wb-intel-header-eyebrow">WhatUPB</div>
            <h1 className="wb-support-title">Support</h1>
            <p className="wb-support-lead">
              Need help with WhatUPB? Get assistance with Intelligence Brief
              purchases and downloads, the WhatUPB Brief newsletter, billing
              questions, corrections, or technical issues.
            </p>
            <p className="wb-support-date">Last updated: September 2026</p>
          </div>

          {/* Sections */}
          <div className="wb-support-sections">

            <section className="wb-support-section">
              <h2 className="wb-support-section-title">Intelligence Briefs</h2>
              <p className="wb-support-body">
                If you purchased a WhatUPB Intelligence Brief and are having
                trouble accessing or downloading it, contact us using the email
                address associated with your purchase. Do not send payment-card
                information.
              </p>
            </section>

            <section className="wb-support-section">
              <h2 className="wb-support-section-title">Billing &amp; Payments</h2>
              <p className="wb-support-body">
                Payments for WhatUPB Intelligence Briefs are securely processed
                by Stripe. For questions about a WhatUPB purchase, include the
                purchase date and email address used at checkout.
              </p>
            </section>

            <section className="wb-support-section">
              <h2 className="wb-support-section-title">WhatUPB Brief Newsletter</h2>
              <p className="wb-support-body">
                For help subscribing to or receiving the free WhatUPB Brief
                newsletter, contact support.
              </p>
            </section>

            <section className="wb-support-section">
              <h2 className="wb-support-section-title">Corrections &amp; Data</h2>
              <p className="wb-support-body">
                WhatUPB uses public records and third-party data sources. If you
                believe published information is inaccurate or requires
                clarification, send the page URL and a description of the issue.
              </p>
            </section>

            <section className="wb-support-section wb-support-section--contact">
              <h2 className="wb-support-section-title">Contact</h2>
              <a
                href="mailto:contact.whatupb@gmail.com"
                className="wb-support-email"
              >
                contact.whatupb@gmail.com
              </a>
              <p className="wb-support-body" style={{ marginTop: "12px" }}>
                We typically respond within 1–2 business days.
              </p>
            </section>

            <section className="wb-support-section wb-support-section--security">
              <h2 className="wb-support-section-title">Security</h2>
              <p className="wb-support-body">
                WhatUPB will never ask you to send passwords, private keys, seed
                phrases, wallet recovery phrases, or full payment-card
                information by email.
              </p>
            </section>

          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="wb-footer">
        <div className="wb-footer-top">
          <div className="wb-footer-brand">
            <span className="wb-footer-wordmark">WhatUPB</span>
            <p className="wb-footer-tagline">
              Government disclosures, crypto policy,
              <br />
              and blockchain activity — connected.
            </p>
          </div>
          <div className="wb-footer-links-col">
            <div className="wb-footer-col-label">Navigate</div>
            <div className="wb-footer-links-row">
              <Link href="/capitol">Capitol</Link>
              <Link href="/policy">Policy</Link>
              <Link href="/chains">Chains</Link>
              <Link href="/tokens">Tokens</Link>
              <Link href="/signals">Signals</Link>
              <Link href="/intelligence">Intelligence</Link>
              <Link href="/about">About</Link>
            </div>
          </div>
          <div className="wb-footer-links-col">
            <div className="wb-footer-col-label">Legal</div>
            <div className="wb-footer-links-row">
              <Link href="/privacy">Privacy</Link>
              <Link href="/terms">Terms</Link>
              <Link href="/content-policy">Content Policy</Link>
              <Link href="/support">Support</Link>
            </div>
          </div>
        </div>
        <div className="wb-footer-bottom">
          <span>© 2026 WhatUPB. All Rights Reserved.</span>
          <span className="wb-footer-disc">
            For informational purposes only. Not financial advice.
          </span>
        </div>
      </footer>
    </div>
  );
}

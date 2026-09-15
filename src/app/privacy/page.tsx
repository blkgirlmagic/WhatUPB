import Link from "next/link";
import MainNav from "@/components/main-nav";
import { DiagonalLines } from "@/components/diagonal-lines";

export const metadata = {
  title: "Privacy Policy | WhatUPB",
  description:
    "WhatUPB Privacy Policy — how we collect, use, store, and share information when you visit the site, subscribe to the newsletter, or purchase an Intelligence Brief.",
};

export default function PrivacyPage() {
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
            <h1 className="wb-support-title">Privacy Policy</h1>
            <p className="wb-support-lead">
              This Privacy Policy describes how WhatUPB collects, uses, stores,
              and shares information when
              you visit this website, subscribe to the WhatUPB Brief, purchase
              a WhatUPB Intelligence Brief, contact us, or otherwise interact
              with WhatUPB services.
            </p>
            <p className="wb-support-date">Last updated: September 2026</p>
          </div>

          {/* Sections */}
          <div className="wb-support-sections">

            <section className="wb-support-section">
              <h2 className="wb-support-section-title">1. Information We Collect</h2>
              <p className="wb-support-body">
                WhatUPB collects only information that is reasonably necessary
                to operate its services. This includes:
              </p>
              <p className="wb-support-body wb-support-body--list">
                <span className="wb-support-list-item">
                  <strong>Email address</strong> — when you subscribe to the
                  free WhatUPB Brief newsletter.
                </span>
                <span className="wb-support-list-item">
                  <strong>Purchase and transaction information</strong> — when
                  you purchase an Intelligence Brief, limited information
                  necessary to confirm and fulfill the order (see Section 3).
                </span>
                <span className="wb-support-list-item">
                  <strong>Information you provide voluntarily</strong> — when
                  you contact WhatUPB by email, such as a name, email address,
                  and any details you choose to include.
                </span>
                <span className="wb-support-list-item">
                  <strong>Technical and usage data</strong> — limited
                  information generated automatically by web infrastructure,
                  including error events and session data used for site
                  performance and error monitoring (see Section 5).
                </span>
              </p>
              <p className="wb-support-body" style={{ marginTop: "12px" }}>
                WhatUPB does not collect payment-card numbers, which are
                handled entirely by Stripe.
              </p>
            </section>

            <section className="wb-support-section">
              <h2 className="wb-support-section-title">2. Newsletter</h2>
              <p className="wb-support-body">
                When you subscribe to the free WhatUPB Brief, WhatUPB stores
                your email address and the information necessary to manage your
                subscription. This information is stored in Supabase, our
                database service provider.
              </p>
              <p className="wb-support-body" style={{ marginTop: "12px" }}>
                You may unsubscribe at any time. Unsubscribe links are included
                in newsletter emails. You may also request removal by contacting{" "}
                <a href="mailto:contact.whatupb@gmail.com" className="wb-support-link">
                  contact.whatupb@gmail.com
                </a>
                .
              </p>
            </section>

            <section className="wb-support-section">
              <h2 className="wb-support-section-title">3. Intelligence Brief Purchases</h2>
              <p className="wb-support-body">
                WhatUPB sells downloadable digital Intelligence Briefs. Payment
                processing is handled by Stripe. WhatUPB does not receive or
                store full payment-card numbers.
              </p>
              <p className="wb-support-body" style={{ marginTop: "12px" }}>
                WhatUPB may receive limited transaction and customer information
                from Stripe — such as a transaction identifier, payment status,
                and email address associated with a purchase — as necessary to
                confirm purchases, provide access to purchased products, respond
                to support requests, prevent fraud, maintain transaction records,
                and resolve disputes.
              </p>
            </section>

            <section className="wb-support-section">
              <h2 className="wb-support-section-title">4. Digital Product Delivery</h2>
              <p className="wb-support-body">
                Intelligence Brief PDF files are stored privately using Supabase
                Storage. Following a confirmed purchase, WhatUPB generates a
                temporary signed access link that allows you to download the
                purchased file. These signed links expire after a short period
                and are not publicly accessible.
              </p>
              <p className="wb-support-body" style={{ marginTop: "12px" }}>
                WhatUPB does not publish, share, or expose private storage
                credentials or bucket contents to users or third parties.
              </p>
            </section>

            <section className="wb-support-section">
              <h2 className="wb-support-section-title">5. Website &amp; Technical Data</h2>
              <p className="wb-support-body">
                WhatUPB uses <strong>Sentry</strong> for error monitoring and
                performance tracking. Sentry may collect technical data
                including error reports, performance metrics, and — for a
                sample of sessions — session replay data that records user
                interactions with the site. Session replay is used to diagnose
                technical problems and improve site performance.
              </p>
              <p className="wb-support-body" style={{ marginTop: "12px" }}>
                Sentry processes this data under its own privacy policy. For
                more information, see{" "}
                <a
                  href="https://sentry.io/privacy/"
                  className="wb-support-link"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  sentry.io/privacy
                </a>
                .
              </p>
              <p className="wb-support-body" style={{ marginTop: "12px" }}>
                WhatUPB is hosted on <strong>Vercel</strong>. Vercel may
                process limited technical information as part of standard web
                hosting and delivery, including IP addresses and request logs.
              </p>
              <p className="wb-support-body" style={{ marginTop: "12px" }}>
                WhatUPB does not currently use third-party behavioral analytics,
                advertising trackers, or marketing pixels.
              </p>
            </section>

            <section className="wb-support-section">
              <h2 className="wb-support-section-title">6. How We Use Information</h2>
              <p className="wb-support-body">
                WhatUPB uses the information it collects to operate the site and
                provide its services. Specific uses include delivering newsletter
                subscriptions, processing and verifying Intelligence Brief
                purchases, providing access to purchased digital products,
                responding to support and correction requests, monitoring and
                correcting technical problems, preventing fraud and maintaining
                security, and complying with legal obligations.
              </p>
              <p className="wb-support-body" style={{ marginTop: "12px" }}>
                WhatUPB does not sell personal information.
              </p>
            </section>

            <section className="wb-support-section">
              <h2 className="wb-support-section-title">7. Third-Party Service Providers</h2>
              <p className="wb-support-body">
                WhatUPB uses the following third-party service providers that
                may process personal information in connection with delivering
                WhatUPB services:
              </p>
              <p className="wb-support-body wb-support-body--list" style={{ marginTop: "12px" }}>
                <span className="wb-support-list-item">
                  <strong>Stripe</strong> — payment processing for Intelligence
                  Brief purchases.
                </span>
                <span className="wb-support-list-item">
                  <strong>Supabase</strong> — database and storage services,
                  used for newsletter subscriber data and Intelligence Brief
                  file storage and delivery.
                </span>
                <span className="wb-support-list-item">
                  <strong>Sentry</strong> — error monitoring and session
                  performance data.
                </span>
                <span className="wb-support-list-item">
                  <strong>Vercel</strong> — website hosting and delivery.
                </span>
              </p>
              <p className="wb-support-body" style={{ marginTop: "12px" }}>
                These providers operate under their own privacy policies and
                data-processing terms. WhatUPB shares information with them
                only as necessary to provide the services described in this
                policy.
              </p>
            </section>

            <section className="wb-support-section">
              <h2 className="wb-support-section-title">8. Data Retention</h2>
              <p className="wb-support-body">
                WhatUPB retains information only as reasonably necessary for
                the purposes described in this policy, including providing
                services, maintaining transaction records, resolving disputes,
                maintaining security, and complying with legal obligations.
                Specific retention periods may vary depending on the type of
                information and applicable legal requirements.
              </p>
              <p className="wb-support-body" style={{ marginTop: "12px" }}>
                Newsletter subscribers may request removal of their email
                address at any time. See Section 2.
              </p>
            </section>

            <section className="wb-support-section">
              <h2 className="wb-support-section-title">9. Data Security</h2>
              <p className="wb-support-body">
                WhatUPB uses reasonable administrative, technical, and
                organizational safeguards designed to protect information
                against unauthorized access, disclosure, alteration, or
                destruction. These include encrypted connections, private
                storage buckets, server-side credential management, and
                time-limited signed access links for digital product delivery.
              </p>
              <p className="wb-support-body" style={{ marginTop: "12px" }}>
                No internet system can guarantee absolute security. If you have
                concerns about a specific interaction, contact us at{" "}
                <a href="mailto:contact.whatupb@gmail.com" className="wb-support-link">
                  contact.whatupb@gmail.com
                </a>
                .
              </p>
            </section>

            <section className="wb-support-section">
              <h2 className="wb-support-section-title">10. Your Privacy Choices &amp; Rights</h2>
              <p className="wb-support-body">
                You may contact WhatUPB to request access to, correction of, or
                deletion of personal information we hold about you. Newsletter
                subscribers may unsubscribe at any time. Additional privacy
                rights may apply depending on your jurisdiction — see Sections
                11 and 12.
              </p>
              <p className="wb-support-body" style={{ marginTop: "12px" }}>
                To make a privacy request, contact:{" "}
                <a href="mailto:contact.whatupb@gmail.com" className="wb-support-link">
                  contact.whatupb@gmail.com
                </a>
              </p>
            </section>

            <section className="wb-support-section">
              <h2 className="wb-support-section-title">11. U.S. State Privacy Rights</h2>
              <p className="wb-support-body">
                Residents of certain U.S. states may have additional rights
                under applicable state privacy laws, which may include rights
                to access, correct, delete, or opt out of certain processing of
                personal information. Whether these rights apply to your
                interactions with WhatUPB may depend on applicable legal
                thresholds and the nature of information collected. To inquire
                about applicable rights, contact us at the address in Section
                15.
              </p>
            </section>

            <section className="wb-support-section">
              <h2 className="wb-support-section-title">12. International Users</h2>
              <p className="wb-support-body">
                WhatUPB is operated in the United States. If you access the
                site from outside the United States, your information may be
                transferred to and processed in the United States. Users
                outside the United States may have rights under applicable
                local privacy laws. To inquire about applicable rights, contact
                us at the address in Section 15.
              </p>
            </section>

            <section className="wb-support-section">
              <h2 className="wb-support-section-title">13. Children&apos;s Privacy</h2>
              <p className="wb-support-body">
                WhatUPB is not directed to children under the age of 13 and
                does not knowingly collect personal information from children
                under 13. If you believe a child under 13 has provided personal
                information to WhatUPB, please contact us and we will work to
                delete it.
              </p>
            </section>

            <section className="wb-support-section">
              <h2 className="wb-support-section-title">14. Changes to This Policy</h2>
              <p className="wb-support-body">
                WhatUPB may update this Privacy Policy as its services,
                practices, or applicable legal requirements change. Material
                changes will be reflected in the &quot;Last updated&quot; date
                at the top of this page. Continued use of WhatUPB after a
                policy update constitutes acceptance of the revised policy.
              </p>
            </section>

            <section className="wb-support-section wb-support-section--contact">
              <h2 className="wb-support-section-title">15. Contact</h2>
              <p className="wb-support-body">
                Privacy questions, requests, or concerns may be directed to
                WhatUPB at:
              </p>
              <a
                href="mailto:contact.whatupb@gmail.com"
                className="wb-support-email"
              >
                contact.whatupb@gmail.com
              </a>
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

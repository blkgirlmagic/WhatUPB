import Link from "next/link";
import MainNav from "@/components/main-nav";
import { DiagonalLines } from "@/components/diagonal-lines";
import { intelligenceReports } from "@/lib/intelligence-reports";

export const metadata = {
  title: "Intelligence | WhatUPB",
  description:
    "WhatUPB Intelligence — paid research briefs on crypto policy, government disclosures, blockchain activity, and digital asset markets.",
};

export default function IntelligencePage() {
  const available = intelligenceReports.filter((r) => r.status === "available");
  const coming = intelligenceReports.filter((r) => r.status === "coming-soon");

  return (
    <div className="wb-page">
      <div className="bloom" />
      <DiagonalLines />
      <MainNav />

      {/* ── Page header ── */}
      <section className="wb-intel-header">
        <div className="wb-intel-header-inner">
          <div className="wb-intel-header-eyebrow">WhatUPB Intelligence</div>
          <h1 className="wb-intel-header-title">
            Research Briefs.<br />Primary Signals.
          </h1>
          <p className="wb-intel-header-sub">
            Concise, sourced intelligence reports on the issues that move
            digital asset markets — policy shifts, government disclosures,
            on-chain data, and the regulatory forces shaping crypto.
          </p>
        </div>
      </section>

      {/* ── Report grid ── */}
      <section className="wb-intel-library">
        <div className="wb-intel-library-inner">

          {available.length > 0 && (
            <>
              <div className="wb-intel-section-label">Available Now</div>
              <div className="wb-intel-grid">
                {available.map((report) => (
                  <Link
                    key={report.slug}
                    href={`/intelligence/${report.slug}`}
                    className="wb-intel-card-link"
                  >
                    <article className="wb-brief-card">
                      {/* Cover image area */}
                      <div className="wb-brief-card-cover">
                        <div className="wb-brief-card-number">
                          Brief {report.briefNumber}
                        </div>
                        <div className="wb-brief-card-title-overlay">
                          {report.title}
                        </div>
                      </div>

                      <div className="wb-brief-card-body">
                        <div className="wb-brief-card-meta">
                          <span className="wb-brief-card-date">
                            {report.publicationDate}
                          </span>
                          <span className="wb-brief-card-pages">
                            {report.pageCount} pages
                          </span>
                        </div>
                        <h2 className="wb-brief-card-headline">{report.title}</h2>
                        <p className="wb-brief-card-sub">{report.subtitle}</p>
                        <p className="wb-brief-card-teaser">{report.teaser}</p>
                        <div className="wb-brief-card-topics">
                          {report.topics.slice(0, 4).map((t) => (
                            <span key={t} className="wb-brief-topic-tag">
                              {t}
                            </span>
                          ))}
                        </div>
                        <div className="wb-brief-card-footer">
                          <span className="wb-brief-card-price">
                            ${report.price.toFixed(2)}
                          </span>
                          <span className="wb-brief-card-cta">
                            Read Brief →
                          </span>
                        </div>
                      </div>
                    </article>
                  </Link>
                ))}
              </div>
            </>
          )}

          {coming.length > 0 && (
            <>
              <div className="wb-intel-section-label wb-intel-section-label--coming">
                Coming Soon
              </div>
              <div className="wb-intel-grid">
                {coming.map((report) => (
                  <article key={report.slug} className="wb-brief-card wb-brief-card--coming">
                    <div className="wb-brief-card-cover wb-brief-card-cover--coming">
                      <div className="wb-brief-card-number">
                        Brief {report.briefNumber}
                      </div>
                      <div className="wb-brief-card-title-overlay">
                        {report.title}
                      </div>
                    </div>
                    <div className="wb-brief-card-body">
                      <div className="wb-brief-card-meta">
                        <span className="wb-brief-card-date">
                          {report.publicationDate}
                        </span>
                        <span className="wb-brief-card-pages">
                          {report.pageCount} pages
                        </span>
                      </div>
                      <h2 className="wb-brief-card-headline">{report.title}</h2>
                      <p className="wb-brief-card-sub">{report.subtitle}</p>
                      <p className="wb-brief-card-teaser">{report.teaser}</p>
                      <div className="wb-brief-card-footer">
                        <span className="wb-brief-coming-label">Coming Soon</span>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            </>
          )}

          {/* Evergreen newsletter CTA */}
          <div className="wb-intel-nl-cta">
            <div className="wb-intel-nl-cta-text">
              <strong>Get notified when new briefs drop.</strong>
              <span> Join the free WhatUPB Brief newsletter.</span>
            </div>
            <Link href="/" className="wb-btn-ghost wb-intel-nl-cta-btn">
              Subscribe Free ↗
            </Link>
          </div>

        </div>
      </section>

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

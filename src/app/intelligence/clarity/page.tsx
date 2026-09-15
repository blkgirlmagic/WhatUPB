import Link from "next/link";
import { notFound } from "next/navigation";
import MainNav from "@/components/main-nav";
import { DiagonalLines } from "@/components/diagonal-lines";
import { getReport } from "@/lib/intelligence-reports";

export const metadata = {
  title: "CLARITY Brief | WhatUPB Intelligence",
  description:
    "WhatUPB Intelligence Brief 001 — CLARITY: What Changed. What Matters. What Happens Next. A 10-page report on the Digital Asset Market CLARITY Act.",
};

export default function ClarityPage() {
  const report = getReport("clarity");
  if (!report) notFound();

  const hasBuyLink = report.stripePaymentLink.trim().length > 0;

  return (
    <div className="wb-page">
      <div className="bloom" />
      <DiagonalLines />
      <MainNav />

      {/* ── Breadcrumb ── */}
      <div className="wb-intel-breadcrumb">
        <div className="wb-intel-breadcrumb-inner">
          <Link href="/intelligence" className="wb-intel-bc-link">
            ← Intelligence
          </Link>
          <span className="wb-intel-bc-sep">/</span>
          <span className="wb-intel-bc-current">Brief {report.briefNumber}</span>
        </div>
      </div>

      {/* ── Hero / Product block ── */}
      <section className="wb-brief-hero">
        <div className="wb-brief-hero-inner">

          {/* Left: cover art placeholder */}
          <div className="wb-brief-cover-wrap">
            <div className="wb-brief-cover-art">
              <div className="wb-brief-cover-number">Brief {report.briefNumber}</div>
              <div className="wb-brief-cover-name">{report.title}</div>
              <div className="wb-brief-cover-sub">{report.subtitle}</div>
            </div>
          </div>

          {/* Right: product details + CTA */}
          <div className="wb-brief-detail">
            <div className="wb-brief-detail-eyebrow">
              WhatUPB Intelligence · Brief {report.briefNumber}
            </div>
            <h1 className="wb-brief-detail-title">{report.title}</h1>
            <p className="wb-brief-detail-subtitle">{report.subtitle}</p>
            <p className="wb-brief-detail-desc">{report.description}</p>

            <div className="wb-brief-detail-specs">
              <div className="wb-brief-spec">
                <span className="wb-brief-spec-label">Published</span>
                <span className="wb-brief-spec-val">{report.publicationDate}</span>
              </div>
              <div className="wb-brief-spec">
                <span className="wb-brief-spec-label">Length</span>
                <span className="wb-brief-spec-val">{report.pageCount} pages</span>
              </div>
              <div className="wb-brief-spec">
                <span className="wb-brief-spec-label">Format</span>
                <span className="wb-brief-spec-val">PDF</span>
              </div>
              <div className="wb-brief-spec">
                <span className="wb-brief-spec-label">Access</span>
                <span className="wb-brief-spec-val">Instant download</span>
              </div>
            </div>

            <div className="wb-brief-topics">
              {report.topics.map((t) => (
                <span key={t} className="wb-brief-topic-tag">{t}</span>
              ))}
            </div>

            {/* Purchase CTA */}
            <div className="wb-brief-purchase">
              <div className="wb-brief-purchase-price">
                ${report.price.toFixed(2)}
              </div>
              {hasBuyLink ? (
                <a
                  href={report.stripePaymentLink}
                  className="wb-btn-primary wb-brief-buy-btn"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Buy Now — Instant PDF Access ↗
                </a>
              ) : (
                <div className="wb-brief-buy-disabled">
                  Purchase link coming soon
                </div>
              )}
              <p className="wb-brief-purchase-fine">
                Secure checkout via Stripe. PDF delivered immediately after
                payment. No subscription required.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── What's inside ── */}
      <section className="wb-brief-inside">
        <div className="wb-brief-inside-inner">
          <h2 className="wb-brief-inside-title">What&apos;s Inside</h2>
          <div className="wb-brief-inside-grid">
            <div className="wb-brief-inside-item">
              <div className="wb-brief-inside-icon">⚖️</div>
              <div className="wb-brief-inside-label">The Regulatory Shift</div>
              <p className="wb-brief-inside-desc">
                How the CLARITY Act restructures SEC and CFTC authority over
                digital assets — and what that means for crypto projects operating
                in the U.S.
              </p>
            </div>
            <div className="wb-brief-inside-item">
              <div className="wb-brief-inside-icon">🏛️</div>
              <div className="wb-brief-inside-label">Political Signals</div>
              <p className="wb-brief-inside-desc">
                Congressional voting patterns, sponsor dynamics, and which factions
                support or oppose the bill — mapped against crypto industry backing.
              </p>
            </div>
            <div className="wb-brief-inside-item">
              <div className="wb-brief-inside-icon">🪙</div>
              <div className="wb-brief-inside-label">DeFi &amp; Stablecoins</div>
              <p className="wb-brief-inside-desc">
                How the CLARITY Act treats DeFi protocols, stablecoin issuers,
                and decentralized exchanges — the framework details that matter
                most for on-chain activity.
              </p>
            </div>
            <div className="wb-brief-inside-item">
              <div className="wb-brief-inside-icon">🔮</div>
              <div className="wb-brief-inside-label">What Happens Next</div>
              <p className="wb-brief-inside-desc">
                Timeline, implementation risks, expected rule-making, and the
                90-day window that will define the next phase of U.S. crypto
                regulation.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Why this brief ── */}
      <section className="wb-brief-why">
        <div className="wb-brief-why-inner">
          <div className="wb-brief-why-quote">
            &ldquo;The CLARITY Act is the most significant U.S. crypto legislation
            in a decade. Ten pages. Everything that matters.&rdquo;
          </div>
          <div className="wb-brief-why-attr">— WhatUPB Editorial</div>
          <div className="wb-brief-why-bullets">
            <div className="wb-brief-why-bullet">✓ Sourced from public legislative records and SEC/CFTC filings</div>
            <div className="wb-brief-why-bullet">✓ Plain-language summary — no legal jargon</div>
            <div className="wb-brief-why-bullet">✓ Written for investors, researchers, and operators</div>
            <div className="wb-brief-why-bullet">✓ No trading calls. No speculation. Just analysis.</div>
          </div>
        </div>
      </section>

      {/* ── Bottom CTA ── */}
      <div className="wb-bottom-cta">
        <div className="wb-bc-title">
          Ten pages. Everything that matters<br />about CLARITY.
        </div>
        <p className="wb-bc-sub">
          Instant PDF download. ${report.price.toFixed(2)} once. No subscription.
        </p>
        {hasBuyLink ? (
          <a
            href={report.stripePaymentLink}
            className="wb-bc-btn"
            target="_blank"
            rel="noopener noreferrer"
          >
            Get the Brief ↗
          </a>
        ) : (
          <Link href="/intelligence" className="wb-bc-btn">
            ← Back to Intelligence
          </Link>
        )}
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

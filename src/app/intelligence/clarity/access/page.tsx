import Link from "next/link";
import { redirect } from "next/navigation";
import MainNav from "@/components/main-nav";
import { DiagonalLines } from "@/components/diagonal-lines";
import { getReport } from "@/lib/intelligence-reports";

export const metadata = {
  title: "Download Your Brief | WhatUPB Intelligence",
  description: "Access your WhatUPB Intelligence PDF download.",
};

interface PageProps {
  searchParams: Promise<{ session_id?: string }>;
}

/**
 * /intelligence/clarity/access?session_id=cs_xxx
 *
 * This is a SERVER COMPONENT. It never exposes the Stripe session ID to
 * client JavaScript beyond what's in the URL. The actual payment
 * verification and signed-URL generation happen server-side in
 * /api/intelligence/download.
 *
 * If no session_id is present, redirect away immediately.
 */
export default async function ClarityAccessPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const sessionId = params.session_id;

  const report = getReport("clarity");
  if (!report) redirect("/intelligence");

  // No session_id in URL — could be direct navigation; bounce them back.
  if (!sessionId) {
    redirect(`/intelligence/${report.slug}`);
  }

  // The download link points to our server-side API route which verifies
  // the Stripe session and returns a signed Supabase storage URL.
  const downloadHref = `/api/intelligence/download?session_id=${encodeURIComponent(
    sessionId
  )}&slug=${encodeURIComponent(report.slug)}`;

  return (
    <div className="wb-page">
      <div className="bloom" />
      <DiagonalLines />
      <MainNav />

      <section className="wb-access-section">
        <div className="wb-access-inner">
          {/* Success state */}
          <div className="wb-access-card">
            <div className="wb-access-icon">✓</div>

            <div className="wb-access-eyebrow">
              WhatUPB Intelligence · Brief {report.briefNumber}
            </div>
            <h1 className="wb-access-title">{report.title}</h1>
            <p className="wb-access-sub">
              Thank you for your purchase. Your brief is ready to download.
            </p>

            <a
              href={downloadHref}
              className="wb-btn-primary wb-access-download-btn"
            >
              Download PDF ↓
            </a>

            <div className="wb-access-notes">
              <div className="wb-access-note">
                📄 <strong>{report.pageCount}-page PDF</strong> — opens in any PDF
                reader
              </div>
              <div className="wb-access-note">
                ⏱ Download link valid for <strong>10 minutes</strong>
              </div>
              <div className="wb-access-note">
                📧 Questions? Email{" "}
                <a href="mailto:support@whatupb.com" className="wb-access-email">
                  support@whatupb.com
                </a>
              </div>
            </div>

            <div className="wb-access-divider" />

            <div className="wb-access-footer-links">
              <Link href="/intelligence" className="wb-intel-bc-link">
                ← Back to Intelligence
              </Link>
              <Link href="/" className="wb-intel-bc-link">
                WhatUPB Home
              </Link>
            </div>
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

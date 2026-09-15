import Link from "next/link";
import MainNav from "@/components/main-nav";
import { DiagonalLines } from "@/components/diagonal-lines";

export const metadata = {
  title: "Content Policy | WhatUPB",
  description:
    "WhatUPB's editorial content policy covering research standards, data sourcing, corrections, and how WhatUPB publishes information on digital assets, government disclosures, and crypto policy.",
};

export default function ContentPolicyPage() {
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
            <h1 className="wb-support-title">Content Policy</h1>
            <p className="wb-support-lead">
              WhatUPB publishes research, analysis, data, and editorial content
              concerning digital assets, government disclosures, crypto policy,
              blockchain activity, and related financial markets. This Content
              Policy explains the standards we use when researching, publishing,
              correcting, and presenting that information.
            </p>
            <p className="wb-support-date">Last updated: September 2026</p>
          </div>

          {/* Sections */}
          <div className="wb-support-sections">

            <section className="wb-support-section">
              <h2 className="wb-support-section-title">1. Editorial Purpose</h2>
              <p className="wb-support-body">
                WhatUPB provides informational and research content intended to
                help readers understand public records, policy developments,
                blockchain data, digital assets, and market activity.
              </p>
              <p className="wb-support-body" style={{ marginTop: "12px" }}>
                WhatUPB does not provide personalized investment, financial,
                legal, or tax advice. Nothing published by WhatUPB should be
                interpreted as a recommendation to buy, sell, or hold any
                security, cryptocurrency, token, or other financial asset.
              </p>
            </section>

            <section className="wb-support-section">
              <h2 className="wb-support-section-title">2. Sources &amp; Data</h2>
              <p className="wb-support-body">
                WhatUPB may use information from sources including government
                records and official disclosures, legislative and regulatory
                documents, blockchain and on-chain data, company and project
                disclosures, established market-data providers, reputable news
                organizations, and other publicly available sources. Whenever
                practical, WhatUPB prioritizes primary sources and identifies
                important source material used in its reporting.
              </p>
              <p className="wb-support-body" style={{ marginTop: "12px" }}>
                Market and blockchain data may be delayed, incomplete, revised,
                or subject to errors originating from third-party providers.
              </p>
            </section>

            <section className="wb-support-section">
              <h2 className="wb-support-section-title">3. Government Financial Disclosures</h2>
              <p className="wb-support-body">
                WhatUPB may report transactions disclosed by elected officials
                and other public officials. Financial disclosure reports often
                provide transaction ranges rather than exact dollar amounts and
                may be reported days or weeks after the underlying transaction.
                WhatUPB will distinguish, where appropriate, between the
                transaction date and the disclosure date and will not represent
                public disclosure information as real-time trading activity.
              </p>
            </section>

            <section className="wb-support-section">
              <h2 className="wb-support-section-title">4. Digital Assets &amp; Market Information</h2>
              <p className="wb-support-body">
                Cryptocurrency and digital-asset markets are volatile and
                involve substantial risk. Prices, market capitalization,
                blockchain activity, token information, and other market data
                can change rapidly. WhatUPB does not guarantee the accuracy,
                completeness, or timeliness of third-party market data.
                WhatUPB does not publish paid trading calls or guarantee
                investment outcomes.
              </p>
            </section>

            <section className="wb-support-section">
              <h2 className="wb-support-section-title">5. Tokens &amp; Emerging Projects</h2>
              <p className="wb-support-body">
                Coverage of a cryptocurrency, token, blockchain project,
                protocol, ICO, token launch, or other digital asset does not
                constitute an endorsement. Where appropriate, WhatUPB may
                discuss project structure, funding, utility, token mechanics,
                regulatory considerations, or risk. Readers should conduct
                independent research before making financial decisions.
              </p>
            </section>

            <section className="wb-support-section">
              <h2 className="wb-support-section-title">6. Analysis &amp; Signals</h2>
              <p className="wb-support-body">
                WhatUPB may combine multiple public datasets or observations to
                identify trends, relationships, or signals. These
                interpretations are editorial analysis. They should not be
                understood as predictions or guarantees of future market
                performance.
              </p>
            </section>

            <section className="wb-support-section">
              <h2 className="wb-support-section-title">7. Intelligence Briefs</h2>
              <p className="wb-support-body">
                WhatUPB Intelligence Briefs are research publications based on
                information available at the time of publication. Because
                policy, legislation, markets, blockchain activity, and digital
                assets can change rapidly, a Brief represents research as of
                its stated publication date unless subsequently updated.
                Intelligence Briefs are provided for informational purposes
                and are not personalized investment, financial, legal, or tax
                advice.
              </p>
            </section>

            <section className="wb-support-section">
              <h2 className="wb-support-section-title">8. Corrections</h2>
              <p className="wb-support-body">
                Accuracy matters to WhatUPB. If WhatUPB identifies a material
                factual error, we may correct or update the published material.
                Readers who believe information is inaccurate may contact us
                at{" "}
                <a href="mailto:contact.whatupb@gmail.com" className="wb-support-link">
                  contact.whatupb@gmail.com
                </a>
                . Include the page URL and a description of the potential error.
              </p>
            </section>

            <section className="wb-support-section">
              <h2 className="wb-support-section-title">9. Artificial Intelligence &amp; Research Tools</h2>
              <p className="wb-support-body">
                WhatUPB may use software, automated systems, artificial
                intelligence tools, and data-analysis tools to assist with
                research, organization, analysis, or production. AI-generated
                or automated output should not be treated as a primary source.
                Material factual claims intended for publication should be
                checked against appropriate source material.
              </p>
            </section>

            <section className="wb-support-section">
              <h2 className="wb-support-section-title">10. Editorial Independence</h2>
              <p className="wb-support-body">
                Payment for a WhatUPB Intelligence Brief, newsletter
                participation, advertising, sponsorship, or other commercial
                relationship does not entitle an outside party to control
                WhatUPB editorial conclusions. Sponsored or paid promotional
                content, if introduced in the future, will be clearly
                identified as such.
              </p>
            </section>

            <section className="wb-support-section">
              <h2 className="wb-support-section-title">11. Changes to This Policy</h2>
              <p className="wb-support-body">
                WhatUPB may update this Content Policy as its research,
                publishing practices, products, or applicable requirements
                evolve.
              </p>
            </section>

            <section className="wb-support-section wb-support-section--contact">
              <h2 className="wb-support-section-title">12. Contact</h2>
              <p className="wb-support-body">
                Questions about this Content Policy or requests for corrections
                may be sent to:
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

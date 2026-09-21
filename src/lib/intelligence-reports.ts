export interface IntelligenceReport {
  slug: string;
  briefNumber: string;
  title: string;
  subtitle: string;
  description: string;
  publicationDate: string;
  pageCount: number;
  price: number;
  coverImage: string;
  /**
   * Stripe Payment Link URL.
   * ⚠️  Insert your actual Stripe Payment Link here before deploying.
   * Example: "https://buy.stripe.com/live_xxxxxxxxxxxx"
   * This is a static payment link, NOT the secret key.
   * After payment Stripe redirects to /intelligence/{slug}/access?session_id={CHECKOUT_SESSION_ID}
   */
  stripePaymentLink: string;
  status: "available" | "coming-soon";
  /** Topics covered — shown as tags on the detail page */
  topics: string[];
  /** Brief 1–3 sentence teaser for library/homepage cards */
  teaser: string;
}

export const intelligenceReports: IntelligenceReport[] = [
  {
    slug: "the-turn",
    briefNumber: "002",
    title: "THE TURN",
    subtitle: "Bitcoin's $85K Breakout, ETF Flows, and What the Data Says About the Cycle.",
    description:
      "Is crypto entering a new bull cycle? WhatUPB examines Bitcoin\'s $85K breakout, Ethereum\'s recovery, ETF flows, leverage, and the signals that could confirm—or challenge—the turn.",
    teaser:
      "Bitcoin cracked $85K. ETF inflows accelerated. Is this the turn — or a trap? Ten pages of signal, no noise.",
    publicationDate: "September 2026",
    pageCount: 10,
    price: 10.99,
    coverImage: "/intelligence/brief-002-the-turn.png",
    stripePaymentLink: "https://buy.stripe.com/7sY3cwdZa9Vbbya1122go01",
    status: "available",
    topics: [
      "Bitcoin",
      "Ethereum",
      "ETF Flows",
      "Bull Cycle",
      "Market Structure",
      "On-Chain Data",
    ],
  },
  {
    slug: "clarity",
    briefNumber: "001",
    title: "CLARITY",
    subtitle: "What Changed. What Matters. What Happens Next.",
    description:
      "A concise WhatUPB intelligence report examining the Digital Asset Market CLARITY Act, the regulatory structure, political signals, SEC/CFTC responsibilities, and what comes next for the crypto industry.",
    teaser:
      "The CLARITY Act rewrites the rulebook on crypto regulation. Who wins, who loses, and what happens inside 90 days.",
    publicationDate: "September 2026",
    pageCount: 10,
    price: 10.99,
    coverImage: "/intelligence/brief-001-clarity.png",
    stripePaymentLink: "https://buy.stripe.com/4gM4gAaMYaZf9q2cJK2go00",
    status: "available",
    topics: [
      "CLARITY Act",
      "SEC / CFTC",
      "DeFi Regulation",
      "Stablecoins",
      "Crypto Policy",
      "Digital Assets",
    ],
  },
];

/** Look up a single report by slug */
export function getReport(slug: string): IntelligenceReport | undefined {
  return intelligenceReports.find((r) => r.slug === slug);
}

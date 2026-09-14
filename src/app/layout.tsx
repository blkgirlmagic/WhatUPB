import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Playfair_Display, IBM_Plex_Mono, Lora } from "next/font/google";
import { ToastProvider } from "@/components/toast";
import { ServiceWorkerRegistrar } from "@/components/ServiceWorkerRegistrar";
import { NewsletterPopup } from "@/components/newsletter";
import "./globals.css";
import "./wb-intelligence.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  weight: ["400", "700", "800"],
});

const ibmPlexMono = IBM_Plex_Mono({
  variable: "--font-ibm-plex-mono",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

const lora = Lora({
  variable: "--font-lora",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  style: ["normal", "italic"],
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: "#9B8EE8",
};

export const metadata: Metadata = {
  title: "WhatUPB — Crypto Intelligence & Public Data",
  description:
    "WhatUPB tracks government financial disclosures, crypto policy, blockchain activity, and emerging digital assets — connecting the signals behind the market.",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "WhatUPB",
  },
  other: {
    "mobile-web-app-capable": "yes",
  },
  icons: {
    apple: "/apple-touch-icon.png",
  },
  openGraph: {
    title: "WhatUPB — Crypto Intelligence & Public Data",
    description:
      "Government disclosures, crypto policy and blockchain activity — connected in one place.",
    url: "https://whatupb.com",
    siteName: "WhatUPB",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "WhatUPB — Crypto Intelligence & Public Data",
    description:
      "Government disclosures, crypto policy and blockchain activity — connected in one place.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${playfair.variable} ${ibmPlexMono.variable} ${lora.variable} antialiased texture-overlay`}
      >
        <ToastProvider>{children}</ToastProvider>
        <ServiceWorkerRegistrar />
        <NewsletterPopup />
      </body>
    </html>
  );
}

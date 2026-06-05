import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Playfair_Display, IBM_Plex_Mono, Lora } from "next/font/google";
import { ToastProvider } from "@/components/toast";
import { ServiceWorkerRegistrar } from "@/components/ServiceWorkerRegistrar";
import "./globals.css";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });
const playfair = Playfair_Display({ variable: "--font-playfair", subsets: ["latin"], weight: ["400", "700", "800"] });
const ibmPlexMono = IBM_Plex_Mono({ variable: "--font-ibm-plex-mono", subsets: ["latin"], weight: ["400", "500", "600"] });
const lora = Lora({ variable: "--font-lora", subsets: ["latin"], weight: ["400", "500", "600", "700"], style: ["normal", "italic"] });

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: "#9B8EE8",
};

export const metadata: Metadata = {
  title: "CoinRep \u2014 Meme Coin Reputation Terminal",
  description:
    "Community-powered reputation scores for meme coins. Submit bullish, bearish, or chaos signals. Real-time rep scores.",
  appleWebApp: { capable: true, statusBarStyle: "default", title: "CoinRep" },
  other: { "mobile-web-app-capable": "yes" },
  icons: { apple: "/apple-touch-icon.png" },
  openGraph: {
    title: "CoinRep \u2014 Meme Coin Reputation Terminal",
    description: "Community-powered reputation scores for meme coins. Bullish, bearish, or chaos \u2014 the crowd never lies.",
    url: "https://coinrep.com",
    siteName: "CoinRep",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "CoinRep \u2014 Meme Coin Reputation Terminal",
    description: "Community-powered reputation scores for meme coins. Bullish, bearish, or chaos \u2014 the crowd never lies.",
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} ${playfair.variable} ${ibmPlexMono.variable} ${lora.variable} antialiased texture-overlay`}>
        <ToastProvider>{children}</ToastProvider>
        <ServiceWorkerRegistrar />
      </body>
    </html>
  );
}

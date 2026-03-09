import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono, Inter } from "next/font/google";
import { ToastProvider } from "@/components/toast";
import AgeGate from "@/components/AgeGate";
import { ServiceWorkerRegistrar } from "@/components/ServiceWorkerRegistrar";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["800"],
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#0c0c10",
  colorScheme: "dark",
};

export const metadata: Metadata = {
  title: "WhatUPB - Anonymous Honest Feedback",
  description:
    "Send and receive anonymous messages honestly. WhatUPB lets anyone share real thoughts without revealing their identity—with built-in abuse blocking.",
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "WhatUPB",
  },
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "32x32", type: "image/x-icon" },
      { url: "/favicon.png?v=8", sizes: "32x32", type: "image/png" },
      { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [{ url: "/apple-touch-icon.png", sizes: "512x512" }],
  },
  other: {
    "mobile-web-app-capable": "yes",
  },
  keywords: [
    "anonymous messaging app",
    "anonymous feedback",
    "honest feedback",
    "send anonymous messages",
  ],
  openGraph: {
    title: "WhatUPB - Anonymous Honest Feedback",
    description:
      "Send and receive anonymous messages honestly. WhatUPB lets anyone share real thoughts without revealing their identity—with built-in abuse blocking.",
    url: "https://whatupb.com",
    siteName: "WhatUPB",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "WhatUPB - Anonymous Honest Feedback",
    description:
      "Send and receive anonymous messages honestly. WhatUPB lets anyone share real thoughts without revealing their identity—with built-in abuse blocking.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@300;400;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${inter.variable} antialiased texture-overlay`}
      >
        <ServiceWorkerRegistrar />
        <AgeGate>
          <ToastProvider>
            <main>{children}</main>
          </ToastProvider>
        </AgeGate>
      </body>
    </html>
  );
}

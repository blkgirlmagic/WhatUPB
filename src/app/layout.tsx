import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Syne, DM_Sans } from "next/font/google";
import { ToastProvider } from "@/components/toast";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const syne = Syne({
  variable: "--font-syne",
  subsets: ["latin"],
  weight: ["400", "700", "800"],
});

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
  weight: ["300", "400", "500"],
  style: ["normal", "italic"],
});

export const metadata: Metadata = {
  title: "WhatUPB — Say What You Really Think",
  description:
    "Get honest, anonymous messages from friends and followers. Share your link, get real talk. Abuse automatically blocked.",
  openGraph: {
    title: "WhatUPB — Anonymous Messages",
    description:
      "Send and receive anonymous messages. Safe, private, and abuse-free.",
    url: "https://whatupb.com",
    siteName: "WhatUPB",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "WhatUPB — Anonymous Messages",
    description:
      "Send and receive anonymous messages. Safe, private, and abuse-free.",
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
        className={`${geistSans.variable} ${geistMono.variable} ${syne.variable} ${dmSans.variable} antialiased texture-overlay`}
      >
        <ToastProvider>{children}</ToastProvider>
      </body>
    </html>
  );
}

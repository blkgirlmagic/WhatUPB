import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ToastProvider } from "@/components/toast";
import AgeGate from "@/components/AgeGate";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "WhatUPB - Anonymous Honest Feedback",
  description:
    "Send and receive anonymous messages honestly. WhatUPB lets anyone share real thoughts without revealing their identity—with built-in abuse blocking.",
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
        className={`${geistSans.variable} ${geistMono.variable} antialiased texture-overlay`}
      >
        <AgeGate>
          <ToastProvider>
            <main>{children}</main>
          </ToastProvider>
        </AgeGate>
      </body>
    </html>
  );
}

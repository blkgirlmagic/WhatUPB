import type { Metadata } from "next";
import DemoClient from "./demo-client";

export const metadata: Metadata = {
  title: "WhatUPB — Say What You Really Think",
  description: "Anonymous messages. No account needed. Share your link publicly.",
  openGraph: {
    title: "WhatUPB — Say What You Really Think",
    description: "Anonymous messages. No account needed. Share your link publicly.",
    url: "https://whatupb.com/demo",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    site: "@GetWhatUPB",
    title: "WhatUPB — Say What You Really Think",
    description: "Anonymous messages. No account needed. Share your link publicly.",
  },
};

export default function DemoPage() {
  return <DemoClient />;
}

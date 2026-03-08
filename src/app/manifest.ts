import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "WhatUPB \u2014 Anonymous Messages",
    short_name: "WhatUPB",
    description:
      "Send and receive anonymous messages honestly. Share real thoughts without revealing your identity.",
    start_url: "/",
    display: "standalone",
    background_color: "#0c0c10",
    theme_color: "#0c0c10",
    orientation: "portrait",
    icons: [
      {
        src: "/icon-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "maskable",
      },
      {
        src: "/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}

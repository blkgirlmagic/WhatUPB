"use client";

import { useEffect } from "react";

/**
 * Registers the service worker in production.
 * Renders nothing — side-effect-only component.
 */
export function ServiceWorkerRegistrar() {
  useEffect(() => {
    if (
      "serviceWorker" in navigator &&
      process.env.NODE_ENV === "production"
    ) {
      navigator.serviceWorker
        .register("/sw.js", { scope: "/" })
        .then((registration) => {
          // Check for SW updates when user returns to the tab
          const onFocus = () => registration.update();
          window.addEventListener("focus", onFocus);
          return () => window.removeEventListener("focus", onFocus);
        })
        .catch((err) => {
          console.error("[sw] Registration failed:", err);
        });
    }
  }, []);

  return null;
}

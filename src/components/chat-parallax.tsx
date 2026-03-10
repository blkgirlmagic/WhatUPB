"use client";

import { useEffect } from "react";

export function ChatParallax() {
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      const x = e.clientX / window.innerWidth - 0.5;
      const y = e.clientY / window.innerHeight - 0.5;
      document.querySelectorAll<HTMLElement>(".chat-float").forEach((cf, i) => {
        const d = [10, 14, 8, 12, 9][i] || 10;
        cf.style.transform = `translate(${x * d}px, ${y * d * 0.4}px)`;
      });
    };
    document.addEventListener("mousemove", handler);
    return () => document.removeEventListener("mousemove", handler);
  }, []);

  return null;
}

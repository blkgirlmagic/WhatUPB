"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase-browser";

/**
 * /auth/callback — handles email confirmation redirects.
 *
 * The signup uses the service-role client (@supabase/supabase-js) which
 * defaults to implicit flow.  Supabase's auth server redirects here with
 * tokens in the URL hash: #access_token=...&refresh_token=...
 *
 * The SSR browser client (@supabase/ssr) is hardcoded to PKCE and will
 * reject implicit-flow hash fragments.  So we parse the hash ourselves
 * and call setSession() directly — this works regardless of flow type.
 */

function parseHashParams(hash: string): Record<string, string> {
  const params: Record<string, string> = {};
  const raw = hash.replace(/^#/, "");
  for (const pair of raw.split("&")) {
    const [key, ...rest] = pair.split("=");
    if (key) params[key] = decodeURIComponent(rest.join("="));
  }
  return params;
}

export default function AuthCallback() {
  const router = useRouter();
  const [status, setStatus] = useState("Confirming your email...");

  useEffect(() => {
    async function handleCallback() {
      const hash = window.location.hash;
      const params = parseHashParams(hash);

      const accessToken = params["access_token"];
      const refreshToken = params["refresh_token"];

      if (accessToken && refreshToken) {
        // Manually set the session — bypasses PKCE/implicit flow mismatch
        const supabase = createClient();
        const { error } = await supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken,
        });

        if (!error) {
          // Clean the hash from the URL before navigating
          window.history.replaceState(null, "", window.location.pathname);
          router.replace("/inbox");
          return;
        }

        // setSession failed — tokens may be expired/invalid
        console.error("[auth/callback] setSession failed:", error.message);
      }

      // No tokens in hash or setSession failed.
      // Check if user already has a session (e.g. already logged in).
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        router.replace("/inbox");
        return;
      }

      // No session at all — email was likely confirmed but we can't
      // create a session.  Send to login with a success message.
      setStatus("Email confirmed! Redirecting to login...");
      setTimeout(() => router.replace("/login?confirmed=true"), 1500);
    }

    handleCallback();
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center animate-fade-in-up">
        <div className="w-6 h-6 border-2 border-denim-200 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-zinc-400 text-sm">{status}</p>
      </div>
    </div>
  );
}

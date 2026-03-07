"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase-browser";

/**
 * /auth/callback — client-side page that completes email confirmation.
 *
 * Supabase uses the implicit flow for email confirmations: the confirmed
 * session tokens arrive in the URL **hash fragment** (#access_token=...).
 * Hash fragments are invisible to server-side code, so this MUST be a
 * client component — a Route Handler (route.ts) can never see them.
 *
 * The Supabase browser client automatically detects the hash fragment,
 * exchanges it for a session, and fires an onAuthStateChange event.
 * We just need to wait for that and then redirect.
 */
export default function AuthCallback() {
  const router = useRouter();

  useEffect(() => {
    const supabase = createClient();

    // The Supabase browser client auto-detects #access_token in the URL
    // and sets the session.  Listen for the session to be established.
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event) => {
      if (event === "SIGNED_IN" || event === "TOKEN_REFRESHED") {
        // Session established — go to inbox
        router.replace("/inbox");
      }
    });

    // Fallback: if the hash fragment is missing or the event doesn't fire
    // within 5 seconds, check if there's already a session (edge case where
    // the user is already logged in), otherwise redirect to login gracefully.
    const timeout = setTimeout(async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        router.replace("/inbox");
      } else {
        router.replace("/login?confirmed=true");
      }
    }, 5000);

    return () => {
      subscription.unsubscribe();
      clearTimeout(timeout);
    };
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center animate-fade-in-up">
        <div className="w-6 h-6 border-2 border-denim-200 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-zinc-400 text-sm">Confirming your email...</p>
      </div>
    </div>
  );
}

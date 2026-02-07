import Link from "next/link";
import { createClient } from "@/lib/supabase-server";

export default async function Home() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4">
      <div className="text-center max-w-md">
        <h1 className="text-5xl font-bold mb-4">WhatUPB</h1>
        <p className="text-zinc-400 text-lg mb-8">
          Get anonymous messages from anyone. Share your link and see what people really think.
        </p>
        {user ? (
          <div className="flex flex-col gap-3">
            <Link
              href="/inbox"
              className="bg-white text-black font-medium py-3 px-6 rounded-lg hover:bg-zinc-200 transition"
            >
              Go to Inbox
            </Link>
            <Link
              href="/settings"
              className="border border-zinc-700 text-white font-medium py-3 px-6 rounded-lg hover:bg-zinc-800 transition"
            >
              Settings
            </Link>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            <Link
              href="/signup"
              className="bg-white text-black font-medium py-3 px-6 rounded-lg hover:bg-zinc-200 transition"
            >
              Create Your Link
            </Link>
            <Link
              href="/login"
              className="border border-zinc-700 text-white font-medium py-3 px-6 rounded-lg hover:bg-zinc-800 transition"
            >
              Log In
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

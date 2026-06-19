import type { Metadata } from "next";
import { createClient } from "@/lib/supabase-server";
import NewsFeed from "./news-feed";

export const metadata: Metadata = {
  title: "WhatUPB — Narrative Feed",
  description: "Latest meme coin news and community signals, updated in real time.",
};

export default async function NewsPage() {
  const supabase = await createClient();

  const [{ data: { user } }, { data: items }] = await Promise.all([
    supabase.auth.getUser(),
    supabase
      .from("news_items")
      .select("id, coin_ticker, headline, vibe, source_url, signal_count, created_at")
      .order("created_at", { ascending: false })
      .limit(60),
  ]);

  return <NewsFeed initialItems={items ?? []} user={user} />;
}

import type { Metadata } from "next";
import { createClient } from "@/lib/supabase-server";
import AlertsFeed, { type Alert } from "./alerts-feed";

export const metadata: Metadata = {
  title: "WhatUPB — Narrative Alerts",
  description: "Real-time alerts when a new crypto narrative emerges or an existing one spikes in momentum.",
};

export default async function AlertsPage() {
  const supabase = await createClient();

  const [{ data: { user } }, { data: alerts }] = await Promise.all([
    supabase.auth.getUser(),
    supabase
      .from("narrative_signals")
      .select("id, signal_type, strength, reason, created_at, narratives(name)")
      .order("created_at", { ascending: false })
      .limit(60),
  ]);

  return <AlertsFeed initialAlerts={(alerts ?? []) as unknown as Alert[]} user={user} />;
}

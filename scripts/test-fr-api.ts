/**
 * Standalone test script for Federal Register API.
 * Run with: tsx scripts/test-fr-api.ts
 *
 * Does NOT touch Supabase. Prints normalised records for inspection.
 */

import { fetchFederalRegisterEvents } from "../src/lib/policy/federal-register";

async function main() {
  console.log("Testing Federal Register API...\n");

  const { events, totalFetched, agencyTermPairs } =
    await fetchFederalRegisterEvents(1); // 1 page per pair for quick test

  console.log(`\n=== Results ===`);
  console.log(`Agency×term pairs checked: ${agencyTermPairs}`);
  console.log(`Total unique documents: ${totalFetched}`);

  if (events.length === 0) {
    console.log("No documents returned.");
    return;
  }

  console.log(`\n=== Sample records (first 5) ===\n`);
  for (const e of events.slice(0, 5)) {
    console.log({
      external_id: e.external_id,
      agency: e.agency,
      category: e.category,
      event_type: e.event_type,
      event_date: e.event_date,
      headline: e.headline.slice(0, 80) + (e.headline.length > 80 ? "..." : ""),
      has_abstract: e.abstract !== null,
      source_url: e.source_url,
    });
    console.log();
  }

  const byCategory: Record<string, number> = {};
  for (const e of events) {
    byCategory[e.category] = (byCategory[e.category] ?? 0) + 1;
  }
  console.log("=== Category breakdown ===");
  for (const [cat, count] of Object.entries(byCategory).sort((a, b) => b[1] - a[1])) {
    console.log(`  ${cat}: ${count}`);
  }

  const byType: Record<string, number> = {};
  for (const e of events) {
    byType[e.event_type] = (byType[e.event_type] ?? 0) + 1;
  }
  console.log("\n=== Event type breakdown ===");
  for (const [type, count] of Object.entries(byType).sort((a, b) => b[1] - a[1])) {
    console.log(`  ${type}: ${count}`);
  }
}

main().catch((err) => {
  console.error("Error:", err);
  process.exit(1);
});

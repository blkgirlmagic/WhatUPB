// Minimal keyword-substring narrative classifier.
//
// No ML, no embeddings — deliberately simple per Phase 2 scope. The keyword
// dictionary lives on `narratives.keywords` in Postgres so it can be tuned
// via SQL without a redeploy. A coin is assigned to whichever narrative has
// the most keyword hits against "<name> <symbol>"; ties go to whichever
// narrative is scanned first. No matches at all → unclassified (null).

export type NarrativeForClassification = {
  id: string;
  name: string;
  keywords: string[] | null;
};

export function classifyCoin(
  name: string,
  symbol: string,
  narratives: NarrativeForClassification[]
): string | null {
  const haystack = `${name} ${symbol}`.toLowerCase();
  let best: { id: string; matches: number } | null = null;

  for (const narrative of narratives) {
    const keywords = narrative.keywords ?? [];
    const matches = keywords.filter((kw) => kw && haystack.includes(kw.toLowerCase())).length;
    if (matches > 0 && (!best || matches > best.matches)) {
      best = { id: narrative.id, matches };
    }
  }

  return best?.id ?? null;
}

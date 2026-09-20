"use client";

import { useState, useTransition } from "react";
import { loadMorePolicyEvents } from "./actions";
import type { PolicyFeedRow } from "./actions";

/** Format ISO date string "YYYY-MM-DD" → "Sep 12, 2026" without timezone shift. */
function formatEventDate(iso: string): string {
  const [year, month, day] = iso.split("-").map(Number);
  return new Date(year, month - 1, day).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

interface PolicyFeedProps {
  initialRows: PolicyFeedRow[];
  initialHasMore: boolean;
}

export default function PolicyFeed({
  initialRows,
  initialHasMore,
}: PolicyFeedProps) {
  const [rows, setRows] = useState<PolicyFeedRow[]>(initialRows);
  const [hasMore, setHasMore] = useState(initialHasMore);
  const [loadError, setLoadError] = useState(false);
  const [isPending, startTransition] = useTransition();

  function handleLoadMore() {
    startTransition(async () => {
      setLoadError(false);
      const result = await loadMorePolicyEvents(rows.length);
      if (result.error) {
        setLoadError(true);
        return;
      }
      setRows((prev) => {
        const seen = new Set(prev.map((r) => r.external_id));
        const fresh = result.rows.filter((r) => !seen.has(r.external_id));
        return [...prev, ...fresh];
      });
      setHasMore(result.hasMore);
    });
  }

  if (rows.length === 0) {
    return (
      <p className="wb-disclaimer">
        No policy updates available yet. Check back after the next ingestion run.
      </p>
    );
  }

  return (
    <>
      <div className="wb-updates-list">
        {rows.map((update, i) => (
          <div key={update.external_id} className="wb-update-item">
            <div className="wb-update-left">
              <span className="wb-update-date">
                {formatEventDate(update.event_date)}
              </span>
              <span className={`wb-update-type utype-${update.event_type}`}>
                {update.event_type}
              </span>
            </div>
            <div className="wb-update-right">
              <span className="wb-update-agency">{update.agency}</span>
              {update.source_url ? (
                <a
                  href={update.source_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="wb-update-headline"
                >
                  {update.headline}
                </a>
              ) : (
                <p className="wb-update-headline">{update.headline}</p>
              )}
            </div>
          </div>
        ))}
      </div>

      {loadError && (
        <p className="wb-disclaimer" style={{ marginTop: "1rem" }}>
          Failed to load more records. Please try again.
        </p>
      )}

      {hasMore && (
        <div style={{ textAlign: "center", marginTop: "1.5rem" }}>
          <button
            onClick={handleLoadMore}
            disabled={isPending}
            className="wb-load-more-btn"
            aria-busy={isPending}
          >
            {isPending ? "Loading…" : "Load More"}
          </button>
        </div>
      )}
    </>
  );
}

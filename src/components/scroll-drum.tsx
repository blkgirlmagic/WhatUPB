"use client";

import { useRef, useEffect, useCallback } from "react";

const ITEM_HEIGHT = 44;
const VISIBLE_ITEMS = 5;
const PADDING_COUNT = 2;

interface DrumItem {
  value: number;
  label: string;
}

interface ScrollDrumProps {
  items: DrumItem[];
  value: number;
  onChange: (value: number) => void;
  width?: string;
}

export default function ScrollDrum({
  items,
  value,
  onChange,
  width = "100px",
}: ScrollDrumProps) {
  const trackRef = useRef<HTMLDivElement>(null);
  const scrollTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isUserScrolling = useRef(false);

  const scrollToIndex = useCallback(
    (index: number, behavior: ScrollBehavior = "instant") => {
      const track = trackRef.current;
      if (!track) return;
      const targetTop = index * ITEM_HEIGHT;
      track.scrollTo({ top: targetTop, behavior });
    },
    []
  );

  // Scroll to the current value on mount
  useEffect(() => {
    const index = items.findIndex((item) => item.value === value);
    if (index >= 0) {
      scrollToIndex(index, "instant");
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // When value changes externally (e.g., day clamped), scroll to it
  useEffect(() => {
    if (isUserScrolling.current) return;
    const index = items.findIndex((item) => item.value === value);
    if (index >= 0) {
      scrollToIndex(index, "smooth");
    }
  }, [value, items, scrollToIndex]);

  const handleScroll = useCallback(() => {
    isUserScrolling.current = true;

    if (scrollTimeoutRef.current) {
      clearTimeout(scrollTimeoutRef.current);
    }

    scrollTimeoutRef.current = setTimeout(() => {
      const track = trackRef.current;
      if (!track) return;

      const centerOffset = track.scrollTop + (VISIBLE_ITEMS / 2) * ITEM_HEIGHT;
      const rawIndex = Math.round(centerOffset / ITEM_HEIGHT) - PADDING_COUNT;
      const clampedIndex = Math.max(0, Math.min(items.length - 1, rawIndex));

      const newValue = items[clampedIndex].value;
      if (newValue !== value) {
        onChange(newValue);
      }

      // Snap precisely to the item
      scrollToIndex(clampedIndex, "smooth");

      setTimeout(() => {
        isUserScrolling.current = false;
      }, 150);
    }, 80);
  }, [items, value, onChange, scrollToIndex]);

  // Clean up timeout on unmount
  useEffect(() => {
    return () => {
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
    };
  }, []);

  const handleItemClick = (index: number) => {
    onChange(items[index].value);
    scrollToIndex(index, "smooth");
  };

  return (
    <div className="scroll-drum-wrapper" style={{ width }}>
      <div className="scroll-drum-highlight" />
      <div
        ref={trackRef}
        className="scroll-drum-track"
        onScroll={handleScroll}
      >
        {/* Top padding */}
        {Array.from({ length: PADDING_COUNT }).map((_, i) => (
          <div key={`pad-top-${i}`} className="scroll-drum-item" />
        ))}

        {/* Actual items */}
        {items.map((item, index) => (
          <div
            key={item.value}
            className="scroll-drum-item"
            onClick={() => handleItemClick(index)}
            style={{ cursor: "pointer" }}
          >
            {item.label}
          </div>
        ))}

        {/* Bottom padding */}
        {Array.from({ length: PADDING_COUNT }).map((_, i) => (
          <div key={`pad-bot-${i}`} className="scroll-drum-item" />
        ))}
      </div>
    </div>
  );
}

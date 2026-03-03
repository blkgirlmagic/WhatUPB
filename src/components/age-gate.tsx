"use client";

import { useState, useMemo, useCallback } from "react";
import ScrollDrum from "./scroll-drum";

const MONTHS = [
  { value: 1, label: "January" },
  { value: 2, label: "February" },
  { value: 3, label: "March" },
  { value: 4, label: "April" },
  { value: 5, label: "May" },
  { value: 6, label: "June" },
  { value: 7, label: "July" },
  { value: 8, label: "August" },
  { value: 9, label: "September" },
  { value: 10, label: "October" },
  { value: 11, label: "November" },
  { value: 12, label: "December" },
];

function getDaysInMonth(month: number, year: number): number {
  return new Date(year, month, 0).getDate();
}

function calculateAge(month: number, day: number, year: number): number {
  const today = new Date();
  const birthDate = new Date(year, month - 1, day);
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  if (
    monthDiff < 0 ||
    (monthDiff === 0 && today.getDate() < birthDate.getDate())
  ) {
    age--;
  }
  return age;
}

interface AgeGateProps {
  onVerified: (dob: { month: number; day: number; year: number }) => void;
}

export default function AgeGate({ onVerified }: AgeGateProps) {
  const currentYear = new Date().getFullYear();

  const [month, setMonth] = useState(1);
  const [day, setDay] = useState(1);
  const [year, setYear] = useState(2000);
  const [status, setStatus] = useState<"idle" | "exiting" | "rejected">(
    "idle"
  );

  // Generate year items descending (most recent first)
  const yearItems = useMemo(() => {
    const items = [];
    for (let y = currentYear; y >= currentYear - 100; y--) {
      items.push({ value: y, label: String(y) });
    }
    return items;
  }, [currentYear]);

  // Day items adjust based on month/year
  const dayItems = useMemo(() => {
    const maxDay = getDaysInMonth(month, year);
    const items = [];
    for (let d = 1; d <= maxDay; d++) {
      items.push({ value: d, label: String(d) });
    }
    return items;
  }, [month, year]);

  // Clamp day when month/year changes reduce available days
  const handleMonthChange = useCallback(
    (m: number) => {
      setMonth(m);
      const maxDay = getDaysInMonth(m, year);
      if (day > maxDay) setDay(maxDay);
    },
    [year, day]
  );

  const handleYearChange = useCallback(
    (y: number) => {
      setYear(y);
      const maxDay = getDaysInMonth(month, y);
      if (day > maxDay) setDay(maxDay);
    },
    [month, day]
  );

  const handleVerify = () => {
    const age = calculateAge(month, day, year);

    if (age >= 18) {
      setStatus("exiting");
      setTimeout(() => {
        onVerified({ month, day, year });
      }, 400);
    } else {
      setStatus("rejected");
      setTimeout(() => {
        window.location.href = "/";
      }, 3000);
    }
  };

  if (status === "rejected") {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center px-6"
        style={{ background: "#0c0c10" }}
      >
        <div className="text-center max-w-md animate-rejection-fade-in">
          <div className="text-4xl mb-6">
            <svg
              className="w-12 h-12 mx-auto text-denim-300 opacity-60"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z"
              />
            </svg>
          </div>
          <p className="text-xl font-semibold text-foreground mb-3">
            Thanks for the interest!
          </p>
          <p className="text-zinc-500 text-sm leading-relaxed">
            Keep us in mind further down the road — we&apos;ll be here.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center px-6 ${
        status === "exiting" ? "animate-age-gate-exit" : ""
      }`}
      style={{ background: "#0c0c10" }}
    >
      <div className="text-center max-w-md w-full">
        {/* Header */}
        <div className="animate-fade-in-up mb-3">
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight bg-gradient-to-r from-denim-200 to-white bg-clip-text text-transparent">
            WhatUPB is for adults only
          </h1>
        </div>

        <div className="animate-fade-in-up-delay-1 mb-10">
          <p className="text-zinc-500 text-sm leading-relaxed">
            You must be 18+ to enter. This is a space for honest, grown-up
            conversations.
          </p>
        </div>

        {/* Date picker drums */}
        <div className="animate-fade-in-up-delay-2 mb-10">
          <p className="text-xs font-medium uppercase tracking-wider text-zinc-600 mb-4">
            Date of birth
          </p>
          <div className="flex items-center justify-center gap-3 sm:gap-4">
            <ScrollDrum
              items={MONTHS}
              value={month}
              onChange={handleMonthChange}
              width="130px"
            />
            <ScrollDrum
              items={dayItems}
              value={day}
              onChange={setDay}
              width="70px"
            />
            <ScrollDrum
              items={yearItems}
              value={year}
              onChange={handleYearChange}
              width="90px"
            />
          </div>
        </div>

        {/* Verify button */}
        <div className="animate-fade-in-up-delay-3">
          <button
            onClick={handleVerify}
            className="btn-primary py-3 px-8 animate-glow-pulse"
          >
            Verify &amp; Enter
          </button>
        </div>
      </div>
    </div>
  );
}

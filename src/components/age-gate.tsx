"use client";

import { useState, useMemo, useCallback } from "react";

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
  const [month, setMonth] = useState(0);
  const [day, setDay] = useState(0);
  const [year, setYear] = useState(0);
  const [status, setStatus] = useState<"idle" | "exiting" | "rejected">(
    "idle"
  );

  // Years: 2026 down to 1920
  const yearOptions = useMemo(() => {
    const items = [];
    for (let y = 2026; y >= 1920; y--) {
      items.push(y);
    }
    return items;
  }, []);

  // Days adjust based on month/year
  const maxDays = useMemo(() => {
    if (!month || !year) return 31;
    return getDaysInMonth(month, year);
  }, [month, year]);

  const handleMonthChange = useCallback(
    (m: number) => {
      setMonth(m);
      if (day > 0 && year > 0) {
        const max = getDaysInMonth(m, year);
        if (day > max) setDay(max);
      }
    },
    [year, day]
  );

  const handleYearChange = useCallback(
    (y: number) => {
      setYear(y);
      if (day > 0 && month > 0) {
        const max = getDaysInMonth(month, y);
        if (day > max) setDay(max);
      }
    },
    [month, day]
  );

  const allSelected = month > 0 && day > 0 && year > 0;

  const handleVerify = () => {
    if (!allSelected) return;

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
      <div
        className="fixed inset-0 z-50 flex items-center justify-center px-6"
        style={{ background: "#0c0c10" }}
      >
        <div className="text-center max-w-md animate-rejection-fade-in">
          <div className="mb-6">
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
      className={`fixed inset-0 z-50 flex items-center justify-center px-6 pt-16 ${
        status === "exiting" ? "animate-age-gate-exit" : ""
      }`}
      style={{ background: "#0c0c10" }}
    >
      <div className="text-center max-w-md w-full">
        {/* Header */}
        <div className="animate-fade-in-up mb-3">
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight bg-gradient-to-r from-denim-200 to-white bg-clip-text text-transparent">
            WhatUPB is 18+
          </h1>
        </div>

        <div className="animate-fade-in-up-delay-1 mb-10">
          <p className="text-zinc-500 text-sm leading-relaxed">
            This is a space for honest, grown-up conversations.
          </p>
        </div>

        {/* Date selects */}
        <div className="animate-fade-in-up-delay-2 mb-10">
          <p className="text-xs font-medium uppercase tracking-wider text-zinc-600 mb-4">
            Date of birth
          </p>
          <div className="flex items-center justify-center gap-3">
            {/* Month */}
            <select
              value={month}
              onChange={(e) => handleMonthChange(Number(e.target.value))}
              className="age-select flex-1 min-w-0"
            >
              <option value={0} disabled>
                Month
              </option>
              {MONTHS.map((m) => (
                <option key={m.value} value={m.value}>
                  {m.label}
                </option>
              ))}
            </select>

            {/* Day */}
            <select
              value={day}
              onChange={(e) => setDay(Number(e.target.value))}
              className="age-select w-20"
            >
              <option value={0} disabled>
                Day
              </option>
              {Array.from({ length: maxDays }, (_, i) => i + 1).map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>

            {/* Year */}
            <select
              value={year}
              onChange={(e) => handleYearChange(Number(e.target.value))}
              className="age-select w-24"
            >
              <option value={0} disabled>
                Year
              </option>
              {yearOptions.map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Verify button */}
        <div className="animate-fade-in-up-delay-3">
          <button
            onClick={handleVerify}
            disabled={!allSelected}
            className="btn-primary py-3 px-8 animate-glow-pulse"
          >
            Verify &amp; Enter
          </button>
        </div>
      </div>
    </div>
  );
}

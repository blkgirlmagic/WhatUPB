"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { createClient } from "@/lib/supabase-browser";
import { useRouter } from "next/navigation";
import Link from "next/link";
import posthog from "posthog-js";

// ── Age gate inline styles — Redesigned Elegant Light theme ──────────────

const ageGateStyles = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700;800&family=DM+Sans:wght@300;400;500&display=swap');

  :root {
    --gate-bg: #fdfcfb;
    --gate-bg-end: #f5f2ed;
    --gate-surface: rgba(0,0,0,0.02);
    --gate-border: rgba(0,0,0,0.07);
    --gate-accent: #8b5cf6;
    --gate-accent2: #a78bfa;
    --gate-text: #1a1a2e;
    --gate-muted: rgba(26,26,46,0.5);
  }

  .gate-wrap {
    min-height: 100vh;
    background: linear-gradient(180deg, var(--gate-bg) 0%, var(--gate-bg-end) 100%);
    display: flex;
    align-items: center;
    justify-content: center;
    font-family: 'DM Sans', sans-serif;
    position: relative;
    overflow: hidden;
  }

  /* Subtle warm grain texture */
  .gate-wrap::before {
    content: '';
    position: fixed;
    inset: 0;
    background:
      radial-gradient(ellipse 70% 55% at 20% 50%, rgba(139,92,246,0.06) 0%, transparent 70%),
      radial-gradient(ellipse 50% 65% at 80% 30%, rgba(167,139,250,0.04) 0%, transparent 70%),
      radial-gradient(ellipse 60% 50% at 50% 90%, rgba(196,181,253,0.05) 0%, transparent 70%);
    pointer-events: none;
    z-index: 0;
  }

  .gate-wrap::after {
    content: '';
    position: fixed;
    inset: -50%;
    width: 200%;
    height: 200%;
    background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.03'/%3E%3C/svg%3E");
    opacity: 0.15;
    pointer-events: none;
    z-index: 0;
    animation: grain 0.5s steps(1) infinite;
  }

  @keyframes grain {
    0%,100% { transform: translate(0,0); }
    10% { transform: translate(-2%,-3%); }
    20% { transform: translate(3%,1%); }
    30% { transform: translate(-1%,4%); }
    40% { transform: translate(4%,-2%); }
    50% { transform: translate(-3%,3%); }
    60% { transform: translate(1%,-4%); }
    70% { transform: translate(-4%,2%); }
    80% { transform: translate(2%,-1%); }
    90% { transform: translate(-2%,4%); }
  }

  /* ── Floating glassmorphism message cards ─────────────────────── */

  .msg-float {
    position: fixed;
    background: rgba(255,255,255,0.30);
    backdrop-filter: blur(12px);
    -webkit-backdrop-filter: blur(12px);
    border: 1px solid rgba(255,255,255,0.20);
    border-radius: 16px;
    padding: 14px 18px;
    font-size: 13px;
    color: #1a1a2e;
    max-width: 240px;
    line-height: 1.5;
    pointer-events: auto;
    z-index: 1;
    opacity: 0;
    box-shadow: 0 8px 32px rgba(0,0,0,0.08);
    transition: box-shadow 0.3s ease;
  }

  .msg-float:hover {
    box-shadow: 0 12px 40px rgba(139,92,246,0.15);
  }

  /* Positions & continuous floating — each card has unique timing */
  .msg-float:nth-child(1) { top: 8%; left: 4%; animation: floatFadeIn 0.8s ease forwards, floatBob1 5s ease-in-out 0.8s infinite; }
  .msg-float:nth-child(2) { top: 10%; right: 4%; animation: floatFadeIn 0.8s ease 0.3s forwards, floatBob2 6.5s ease-in-out 1.1s infinite; }
  .msg-float:nth-child(3) { top: 38%; left: 2%; animation: floatFadeIn 0.8s ease 0.6s forwards, floatBob3 4.5s ease-in-out 1.4s infinite; }
  .msg-float:nth-child(4) { top: 42%; right: 2%; animation: floatFadeIn 0.8s ease 0.9s forwards, floatBob1 7s ease-in-out 1.7s infinite; }
  .msg-float:nth-child(5) { bottom: 14%; left: 5%; animation: floatFadeIn 0.8s ease 1.2s forwards, floatBob2 5.5s ease-in-out 2s infinite; }
  .msg-float:nth-child(6) { bottom: 10%; right: 5%; animation: floatFadeIn 0.8s ease 1.5s forwards, floatBob3 6s ease-in-out 2.3s infinite; }

  @keyframes floatFadeIn {
    0% { opacity: 0; transform: translateY(16px); }
    100% { opacity: 1; transform: translateY(0); }
  }

  @keyframes floatBob1 {
    0%, 100% { transform: translateY(0) translateX(0); }
    25% { transform: translateY(-10px) translateX(6px); }
    50% { transform: translateY(-4px) translateX(-3px); }
    75% { transform: translateY(-12px) translateX(4px); }
  }

  @keyframes floatBob2 {
    0%, 100% { transform: translateY(0) translateX(0); }
    25% { transform: translateY(-8px) translateX(-5px); }
    50% { transform: translateY(-14px) translateX(4px); }
    75% { transform: translateY(-6px) translateX(-7px); }
  }

  @keyframes floatBob3 {
    0%, 100% { transform: translateY(0) translateX(0); }
    25% { transform: translateY(-14px) translateX(3px); }
    50% { transform: translateY(-6px) translateX(-5px); }
    75% { transform: translateY(-10px) translateX(8px); }
  }

  /* Hide floating cards on small screens to avoid overlap */
  @media (max-width: 900px) {
    .msg-float { display: none; }
  }

  /* ── Card & Badge ─────────────────────────────────────────────── */

  .gate-card {
    position: relative;
    z-index: 10;
    width: 100%;
    max-width: 460px;
    margin: 24px;
    animation: cardUp 0.7s cubic-bezier(0.16, 1, 0.3, 1) both;
  }

  @keyframes cardUp {
    from { opacity: 0; transform: translateY(30px); }
    to { opacity: 1; transform: translateY(0); }
  }

  .gate-badge {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    background: rgba(139,92,246,0.08);
    border: 1px solid rgba(139,92,246,0.18);
    border-radius: 100px;
    padding: 5px 12px;
    font-size: 11px;
    font-weight: 500;
    color: #7c3aed;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    margin-bottom: 20px;
    animation: cardUp 0.7s 0.1s cubic-bezier(0.16, 1, 0.3, 1) both;
  }

  .gate-badge-dot {
    width: 6px; height: 6px;
    border-radius: 50%;
    background: #8b5cf6;
    animation: pulse 2s infinite;
  }

  @keyframes pulse {
    0%, 100% { opacity: 1; transform: scale(1); }
    50% { opacity: 0.5; transform: scale(0.7); }
  }

  /* ── Headline — Playfair Display ──────────────────────────────── */

  .gate-headline {
    font-family: 'Playfair Display', 'Cormorant Garamond', serif;
    font-size: clamp(36px, 7vw, 52px);
    font-weight: 800;
    line-height: 1.1;
    color: var(--gate-text);
    letter-spacing: -0.02em;
    margin-bottom: 16px;
    animation: cardUp 0.7s 0.15s cubic-bezier(0.16, 1, 0.3, 1) both;
  }

  .gate-headline span {
    background: linear-gradient(135deg, #8b5cf6, #a78bfa);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }

  .gate-subtext {
    font-size: 15px;
    color: var(--gate-muted);
    line-height: 1.65;
    margin-bottom: 28px;
    font-weight: 300;
    animation: cardUp 0.7s 0.2s cubic-bezier(0.16, 1, 0.3, 1) both;
  }

  /* ── Trust badges with 4th AI badge ───────────────────────────── */

  .gate-features {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    margin-bottom: 20px;
    animation: cardUp 0.7s 0.25s cubic-bezier(0.16, 1, 0.3, 1) both;
  }

  .gate-feat {
    background: rgba(255,255,255,0.7);
    border: 1px solid rgba(0,0,0,0.06);
    border-radius: 8px;
    padding: 6px 11px;
    font-size: 12px;
    color: rgba(26,26,46,0.55);
    display: flex;
    align-items: center;
    gap: 6px;
    box-shadow: 0 1px 3px rgba(0,0,0,0.03);
  }

  /* ── Example message ──────────────────────────────────────────── */

  .gate-example {
    background: rgba(139,92,246,0.04);
    border: 1px solid rgba(139,92,246,0.1);
    border-radius: 14px;
    padding: 14px 18px;
    margin-bottom: 20px;
    animation: cardUp 0.7s 0.28s cubic-bezier(0.16, 1, 0.3, 1) both;
  }

  .gate-example-label {
    font-size: 10px;
    font-weight: 500;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: rgba(139,92,246,0.5);
    margin-bottom: 6px;
  }

  .gate-example-text {
    font-size: 14px;
    color: rgba(26,26,46,0.55);
    line-height: 1.5;
    font-style: italic;
  }

  /* ── Social proof section ─────────────────────────────────────── */

  .social-proof {
    margin-bottom: 28px;
    animation: cardUp 0.7s 0.32s cubic-bezier(0.16, 1, 0.3, 1) both;
  }

  .social-proof-title {
    font-size: 11px;
    font-weight: 500;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: rgba(26,26,46,0.35);
    margin-bottom: 10px;
  }

  .social-proof-cards {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .social-proof-card {
    background: rgba(255,255,255,0.5);
    backdrop-filter: blur(6px);
    border: 1px solid rgba(0,0,0,0.04);
    border-radius: 12px;
    padding: 12px 16px;
    font-size: 13px;
    color: rgba(26,26,46,0.5);
    line-height: 1.5;
    font-style: italic;
    filter: blur(0.5px);
    transition: filter 0.3s ease;
  }

  .social-proof-card:hover {
    filter: blur(0px);
  }

  /* ── Main card box ────────────────────────────────────────────── */

  .gate-box {
    background: rgba(255,255,255,0.7);
    border: 1px solid rgba(0,0,0,0.06);
    border-radius: 20px;
    padding: 28px;
    backdrop-filter: blur(12px);
    box-shadow: 0 8px 32px rgba(0,0,0,0.04), 0 1px 3px rgba(0,0,0,0.03);
    animation: cardUp 0.7s 0.35s cubic-bezier(0.16, 1, 0.3, 1) both;
  }

  .gate-label {
    font-size: 11px;
    font-weight: 500;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: var(--gate-muted);
    margin-bottom: 14px;
  }

  /* ── Start my page button with ripple ─────────────────────────── */

  .tap-btn {
    width: 100%;
    padding: 18px;
    background: linear-gradient(135deg, #8b5cf6, #a78bfa);
    border: none;
    border-radius: 14px;
    color: white;
    font-family: 'DM Sans', sans-serif;
    font-size: 16px;
    font-weight: 500;
    cursor: pointer;
    margin-bottom: 12px;
    transition: all 0.25s ease;
    position: relative;
    overflow: hidden;
    box-shadow: 0 4px 16px rgba(139,92,246,0.25);
  }

  .tap-btn::before {
    content: '';
    position: absolute;
    inset: 0;
    background: linear-gradient(135deg, #a78bfa, #c4b5fd);
    opacity: 0;
    transition: opacity 0.25s;
  }

  .tap-btn:hover::before { opacity: 1; }
  .tap-btn:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 28px rgba(139,92,246,0.4);
  }
  .tap-btn:active {
    transform: translateY(0);
    background: linear-gradient(135deg, #7c3aed, #8b5cf6);
  }

  .tap-btn-text {
    position: relative;
    z-index: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
  }

  /* Ripple effect */
  .ripple {
    position: absolute;
    border-radius: 50%;
    background: rgba(255,255,255,0.4);
    transform: scale(0);
    animation: rippleAnim 0.6s ease-out forwards;
    pointer-events: none;
    z-index: 0;
  }

  @keyframes rippleAnim {
    to {
      transform: scale(4);
      opacity: 0;
    }
  }

  /* ── DOB section ──────────────────────────────────────────────── */

  .gate-divider {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-bottom: 12px;
    color: var(--gate-muted);
    font-size: 11px;
    letter-spacing: 0.05em;
  }

  .gate-divider::before, .gate-divider::after {
    content: '';
    flex: 1;
    height: 1px;
    background: rgba(0,0,0,0.08);
  }

  .dob-row {
    display: grid;
    grid-template-columns: 2fr 1fr 1.5fr;
    gap: 8px;
    margin-bottom: 16px;
  }

  .dob-select {
    background: rgba(255,255,255,0.9);
    border: 1px solid rgba(0,0,0,0.1);
    border-radius: 10px;
    padding: 12px 10px;
    color: var(--gate-text);
    font-family: 'DM Sans', sans-serif;
    font-size: 14px;
    cursor: pointer;
    transition: border-color 0.2s, box-shadow 0.2s;
    appearance: none;
    -webkit-appearance: none;
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='6' viewBox='0 0 10 6'%3E%3Cpath d='M1 1l4 4 4-4' stroke='rgba(26,26,46,0.3)' stroke-width='1.5' fill='none' stroke-linecap='round'/%3E%3C/svg%3E");
    background-repeat: no-repeat;
    background-position: right 10px center;
    padding-right: 28px;
  }

  .dob-select:focus {
    outline: none;
    border-color: rgba(139,92,246,0.5);
    box-shadow: 0 0 0 3px rgba(139,92,246,0.08);
  }

  .dob-select option { background: #fff; color: var(--gate-text); }

  .gate-reassurance {
    font-size: 12px;
    color: rgba(26,26,46,0.4);
    text-align: center;
    margin-bottom: 14px;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 5px;
  }

  .verify-btn {
    width: 100%;
    padding: 15px;
    background: linear-gradient(135deg, #8b5cf6, #7c3aed);
    border: none;
    border-radius: 12px;
    color: white;
    font-family: 'DM Sans', sans-serif;
    font-size: 15px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.25s ease;
    margin-bottom: 14px;
    box-shadow: 0 2px 8px rgba(139,92,246,0.2);
  }

  .verify-btn:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(139,92,246,0.35);
    background: linear-gradient(135deg, #a78bfa, #8b5cf6);
  }

  .verify-btn:disabled {
    opacity: 0.4;
    cursor: not-allowed;
  }

  .gate-fine-print {
    font-size: 11px;
    color: var(--gate-muted);
    text-align: center;
    line-height: 1.5;
    opacity: 0.6;
  }

  .gate-helper {
    text-align: center;
    margin-top: 18px;
    font-size: 13px;
    color: rgba(26,26,46,0.35);
    animation: cardUp 0.7s 0.4s cubic-bezier(0.16, 1, 0.3, 1) both;
  }

  .gate-error-msg {
    background: rgba(220,38,38,0.06);
    border: 1px solid rgba(220,38,38,0.2);
    border-radius: 10px;
    padding: 10px 14px;
    font-size: 13px;
    color: #dc2626;
    margin-bottom: 14px;
    animation: shake 0.4s ease;
  }

  @keyframes shake {
    0%, 100% { transform: translateX(0); }
    25% { transform: translateX(-6px); }
    75% { transform: translateX(6px); }
  }

  /* ── Success overlay with confetti ────────────────────────────── */

  .gate-success-overlay {
    position: fixed;
    inset: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-direction: column;
    gap: 16px;
    background: linear-gradient(180deg, #fdfcfb 0%, #f5f2ed 100%);
    z-index: 100;
    animation: fadeIn 0.4s ease;
  }

  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }

  .gate-success-icon {
    width: 64px; height: 64px;
    background: linear-gradient(135deg, #8b5cf6, #a78bfa);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 28px;
    color: white;
    animation: popIn 0.5s cubic-bezier(0.16, 1, 0.3, 1);
    box-shadow: 0 8px 24px rgba(139,92,246,0.25);
  }

  @keyframes popIn {
    from { transform: scale(0); }
    to { transform: scale(1); }
  }

  .gate-success-text {
    font-family: 'Playfair Display', serif;
    font-size: 32px;
    font-weight: 700;
    color: var(--gate-text);
    letter-spacing: -0.01em;
  }

  .gate-toast {
    position: fixed;
    top: 24px;
    left: 50%;
    transform: translateX(-50%);
    background: rgba(139,92,246,0.95);
    color: white;
    padding: 12px 24px;
    border-radius: 12px;
    font-size: 14px;
    font-weight: 500;
    z-index: 200;
    animation: toastSlide 0.5s ease forwards;
    box-shadow: 0 4px 20px rgba(139,92,246,0.3);
  }

  @keyframes toastSlide {
    from { opacity: 0; transform: translateX(-50%) translateY(-20px); }
    to { opacity: 1; transform: translateX(-50%) translateY(0); }
  }

  /* Confetti */
  .confetti-container {
    position: fixed;
    inset: 0;
    pointer-events: none;
    z-index: 150;
    overflow: hidden;
  }

  .confetti-piece {
    position: absolute;
    width: 8px;
    height: 8px;
    top: -10px;
    opacity: 0;
    animation: confettiFall 3s ease forwards;
  }

  @keyframes confettiFall {
    0% { opacity: 1; top: -10px; transform: rotate(0deg) translateX(0); }
    100% { opacity: 0; top: 110vh; transform: rotate(720deg) translateX(80px); }
  }
`;

// ── Age gate data ─────────────────────────────────────────────────────────

const GATE_MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];
const GATE_DAYS = Array.from({ length: 31 }, (_, i) => i + 1);
const GATE_YEARS = Array.from({ length: 100 }, (_, i) => new Date().getFullYear() - i);

// ── Password rules ────────────────────────────────────────────────────────

const PASSWORD_RULES = [
  { key: "length", label: "At least 8 characters", test: (p: string) => p.length >= 8 },
  { key: "uppercase", label: "One uppercase letter", test: (p: string) => /[A-Z]/.test(p) },
  { key: "number", label: "One number", test: (p: string) => /[0-9]/.test(p) },
  { key: "special", label: "One special character (!@#$%^&*)", test: (p: string) => /[!@#$%^&*]/.test(p) },
] as const;

interface AgeData {
  month: number;
  day: number;
  year: number;
}

function calculateAge(month: number, day: number, year: number): number {
  const today = new Date();
  const birthDate = new Date(year, month - 1, day);
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age;
}

async function setAgeCookie(dob: AgeData): Promise<void> {
  try {
    await fetch("/api/verify-age", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(dob),
    });
  } catch {
    // Non-blocking — signup API has its own server-side age check
  }
}

// Confetti generator for success state
function generateConfetti(): React.ReactNode {
  const pieces = [];
  const colors = ["#8b5cf6", "#a78bfa", "#c4b5fd", "#ffffff", "#ddd6fe"];
  for (let i = 0; i < 40; i++) {
    const left = Math.random() * 100;
    const delay = Math.random() * 1.5;
    const size = 6 + Math.random() * 6;
    const color = colors[Math.floor(Math.random() * colors.length)];
    const shape = Math.random() > 0.5 ? "50%" : "2px";
    pieces.push(
      <div
        key={i}
        className="confetti-piece"
        style={{
          left: `${left}%`,
          animationDelay: `${delay}s`,
          width: size,
          height: size,
          background: color,
          borderRadius: shape,
        }}
      />
    );
  }
  return <div className="confetti-container">{pieces}</div>;
}

export default function SignUp() {
  const [phase, setPhase] = useState<"age-gate" | "signup">("age-gate");
  const [ageData, setAgeData] = useState<AgeData | null>(null);

  const [dobMonth, setDobMonth] = useState("");
  const [dobDay, setDobDay] = useState("");
  const [dobYear, setDobYear] = useState("");
  const [ageError, setAgeError] = useState("");
  const [ageSuccess, setAgeSuccess] = useState(false);
  const [blocked, setBlocked] = useState(false);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [error, setError] = useState("");
  const [errorCode, setErrorCode] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    if (typeof window !== "undefined") {
      const isBlocked = localStorage.getItem("whatupb_age_blocked") === "1";
      if (isBlocked) {
        setBlocked(true);
      }
    }
  }, []);

  const passwordChecks = useMemo(
    () => PASSWORD_RULES.map((rule) => ({ ...rule, passed: rule.test(password) })),
    [password]
  );
  const passedCount = passwordChecks.filter((c) => c.passed).length;
  const allPassed = passedCount === PASSWORD_RULES.length;
  const strength: "none" | "weak" | "medium" | "strong" =
    password.length === 0 ? "none"
      : passedCount <= 1 ? "weak"
        : passedCount <= 3 ? "medium"
          : "strong";

  const canSubmitDob = dobMonth && dobDay && dobYear;

  function handleAgeVerified(dob: AgeData) {
    setAgeData(dob);
    setAgeSuccess(true);
    setTimeout(() => { setPhase("signup"); }, 1800);
  }

  // Ripple effect handler
  const handleRipple = useCallback((e: React.MouseEvent<HTMLButtonElement>) => {
    const btn = e.currentTarget;
    const rect = btn.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const ripple = document.createElement("span");
    ripple.className = "ripple";
    ripple.style.left = `${x}px`;
    ripple.style.top = `${y}px`;
    ripple.style.width = "20px";
    ripple.style.height = "20px";
    btn.appendChild(ripple);
    setTimeout(() => ripple.remove(), 600);
  }, []);

  async function handleTap(e: React.MouseEvent<HTMLButtonElement>) {
    if (!canSubmitDob) return;
    const m = parseInt(dobMonth);
    const d = parseInt(dobDay);
    const y = parseInt(dobYear);
    const age = calculateAge(m, d, y);
    const dob: AgeData = { month: m, day: d, year: y };

    if (age < 18) {
      localStorage.setItem("whatupb_age_blocked", "1");
      document.cookie = "age_blocked_client=1; path=/; max-age=315360000; SameSite=Strict";
      setAgeCookie(dob);
      setAgeError("Thanks for stopping by! WhatUPB is for 18+ only. Come back when you're of age \u2014 we'll be here.");
      setBlocked(true);
      return;
    }

    handleRipple(e);
    await setAgeCookie(dob);
    handleAgeVerified(dob);
  }


  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setErrorCode("");
    setLoading(true);

    const trimmedUsername = username.trim().toLowerCase();

    if (!/^[a-z0-9_]{3,20}$/.test(trimmedUsername)) {
      setError("Username must be 3-20 characters: letters, numbers, underscores only.");
      setLoading(false);
      return;
    }

    if (!allPassed) {
      setError("Password doesn't meet all requirements.");
      setLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: trimmedUsername,
          email,
          password,
          month: ageData!.month,
          day: ageData!.day,
          year: ageData!.year,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Signup failed. Please try again.");
        if (data.code) setErrorCode(data.code);
        setLoading(false);
        return;
      }

      const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });

      if (signInError) {
        setError("Account created! Please check your email to confirm, then log in.");
        setLoading(false);
        return;
      }

      posthog.capture("user_signed_up");
      posthog.capture("link_created");
      router.push("/inbox");
      router.refresh();
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  // ════════════════════════════════════════════════════════════════════════
  // PHASE 1: Age Gate
  // ════════════════════════════════════════════════════════════════════════

  if (phase === "age-gate") {
    if (blocked && !ageSuccess) {
      return (
        <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "24px", background: "linear-gradient(180deg, #fdfcfb 0%, #f5f2ed 100%)" }}>
          <div className="text-center max-w-md">
            <div className="mb-6">
              <div style={{ width: 56, height: 56, margin: "0 auto", borderRadius: "50%", background: "rgba(139,92,246,0.08)", border: "1px solid rgba(139,92,246,0.15)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="#8b5cf6" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
                </svg>
              </div>
            </div>
            <p className="text-xl font-semibold mb-3" style={{ color: "#1a1a2e", fontFamily: "'DM Sans', sans-serif" }}>Thanks for the interest!</p>
            <p className="text-sm leading-relaxed mb-8" style={{ color: "#6b7280", fontFamily: "'DM Sans', sans-serif" }}>Keep us in mind further down the road &mdash; we&apos;ll be here.</p>
            <a
              href="/"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                padding: "12px 28px",
                background: "linear-gradient(135deg, #8b5cf6, #a78bfa)",
                color: "white",
                borderRadius: "12px",
                fontSize: "14px",
                fontWeight: 500,
                fontFamily: "'DM Sans', sans-serif",
                textDecoration: "none",
                boxShadow: "0 4px 16px rgba(139,92,246,0.25)",
                transition: "all 0.25s ease",
              }}
            >
              &larr; Back to WhatUPB
            </a>
          </div>
        </div>
      );
    }

    if (ageSuccess) {
      return (
        <>
          <style>{ageGateStyles}</style>
          {generateConfetti()}
          <div className="gate-toast">Welcome to real talk</div>
          <div className="gate-success-overlay">
            <div className="gate-success-icon">&#10003;</div>
            <div className="gate-success-text">Welcome In</div>
            <p style={{ color: "rgba(26,26,46,0.4)", fontSize: "14px" }}>Taking you to WhatUPB&hellip;</p>
          </div>
        </>
      );
    }

    return (
      <>
        <style>{ageGateStyles}</style>
        <div className="gate-wrap">
          {/* 6 Floating glassmorphism message cards */}
          <div className="msg-float">You&apos;ve always had my back &mdash; thank you for being real.</div>
          <div className="msg-float">Your advice changed how I see things. You&apos;re wiser than you think.</div>
          <div className="msg-float">I admire how you handle tough days with grace.</div>
          <div className="msg-float">You&apos;re low-key hilarious &mdash; I laugh every time we&apos;re together.</div>
          <div className="msg-float">I wish I could tell you face-to-face how much you mean to me.</div>
          <div className="msg-float">Your energy lights up the room &mdash; don&apos;t ever dim it.</div>

          <div className="gate-card">
            <div className="gate-badge">
              <div className="gate-badge-dot" />
              18+ Community
            </div>

            <h1 className="gate-headline">
              Unlock the <span>Real Talk</span><br />You&apos;ve Been Missing.
            </h1>

            <p className="gate-subtext">
              Get the honest words your friends think but never say &mdash; anonymously and safely.
            </p>

            <div className="gate-features">
              <div className="gate-feat">&#128274; 100% anonymous</div>
              <div className="gate-feat">&#128737; No data sold</div>
              <div className="gate-feat">&#10024; Real conversations</div>
              <div className="gate-feat">&#129302; Abuse auto-blocked with AI</div>
            </div>

            <div className="gate-example">
              <div className="gate-example-label">Example message</div>
              <div className="gate-example-text">
                &ldquo;I think you inspire more people than you know.&rdquo;
              </div>
            </div>

            {/* Social proof section */}
            <div className="social-proof">
              <div className="social-proof-title">What people are saying:</div>
              <div className="social-proof-cards">
                <div className="social-proof-card">
                  &ldquo;Brutal but fair roast on my dating profile &mdash; exactly what I needed &#128517;&rdquo;
                </div>
                <div className="social-proof-card">
                  &ldquo;Got surprisingly sweet feedback from friends I never expected.&rdquo;
                </div>
              </div>
            </div>

            <div className="gate-box">
              <div className="gate-label">Enter your date of birth</div>

              <div className="dob-row">
                <select className="dob-select" value={dobMonth} onChange={(e) => { setDobMonth(e.target.value); setAgeError(""); }}>
                  <option value="">Month</option>
                  {GATE_MONTHS.map((m, i) => (<option key={m} value={i + 1}>{m}</option>))}
                </select>
                <select className="dob-select" value={dobDay} onChange={(e) => { setDobDay(e.target.value); setAgeError(""); }}>
                  <option value="">Day</option>
                  {GATE_DAYS.map((d) => (<option key={d} value={d}>{d}</option>))}
                </select>
                <select className="dob-select" value={dobYear} onChange={(e) => { setDobYear(e.target.value); setAgeError(""); }}>
                  <option value="">Year</option>
                  {GATE_YEARS.map((y) => (<option key={y} value={y}>{y}</option>))}
                </select>
              </div>

              <p className="gate-reassurance">&#128274; Your date of birth is only used to verify your age.</p>

              {ageError && <div className="gate-error-msg">{ageError}</div>}

              <button className="tap-btn" onClick={handleTap} type="button" disabled={!canSubmitDob} style={!canSubmitDob ? { opacity: 0.5, cursor: "not-allowed" } : {}}>
                <div className="tap-btn-text">
                  <span>&#10148;</span>
                  <span>Start my page</span>
                </div>
              </button>

              <p className="gate-fine-print">
                By continuing, you confirm you are 18+ and agree to our Terms of Service.
              </p>
            </div>

            <p className="gate-helper">Takes less than 10 seconds to get started.</p>
          </div>
        </div>
      </>
    );
  }

  // ════════════════════════════════════════════════════════════════════════
  // PHASE 2: Signup Form
  // ════════════════════════════════════════════════════════════════════════

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4" style={{ background: "linear-gradient(180deg, #fdfcfb 0%, #f5f2ed 100%)" }}>
      <div className="w-full max-w-sm animate-welcome-glow">
        <div className="animate-fade-in-up">
          <div className="text-center mb-8">
            <Link href="/" className="text-2xl font-bold" style={{ color: "#1a1a2e" }}>WhatUPB</Link>
          </div>
          <h1 className="text-2xl font-bold mb-1 text-center tracking-tight" style={{ color: "#1a1a2e" }}>Create your link</h1>
          <p className="text-sm text-center mb-8" style={{ color: "#6b7280" }}>Takes 30 seconds. Start getting anonymous messages.</p>
        </div>

        {error && (
          <div className="flex items-start gap-3 px-4 py-3 rounded-xl mb-4 text-sm" style={{ background: "rgba(220,38,38,0.06)", border: "1px solid rgba(220,38,38,0.15)", color: "#dc2626" }}>
            <svg className="w-4 h-4 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            {errorCode === "EMAIL_EXISTS" ? (
              <span>This email is already in use. Try{" "}<Link href="/login" className="underline transition" style={{ color: "#8b5cf6" }}>logging in</Link>{" "}or use a different email.</span>
            ) : (error)}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="text-xs font-medium uppercase tracking-wider mb-1.5 block" style={{ color: "#6b7280" }}>Username</label>
            <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} placeholder="yourname" required className="input" style={{ background: "#ffffff", border: "1px solid #d1d5db", color: "#1a1a2e" }} />
            <p className="text-xs mt-1.5" style={{ color: "#9ca3af" }}>Your link will be{" "}<span className="font-mono" style={{ color: "#8b5cf6" }}>whatupb.com/{username.toLowerCase() || "yourname"}</span></p>
          </div>
          <div>
            <label className="text-xs font-medium uppercase tracking-wider mb-1.5 block" style={{ color: "#6b7280" }}>Email</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@email.com" required className="input" style={{ background: "#ffffff", border: "1px solid #d1d5db", color: "#1a1a2e" }} />
          </div>
          <div>
            <label className="text-xs font-medium uppercase tracking-wider mb-1.5 block" style={{ color: "#6b7280" }}>Password</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Min 8 characters" required className="input" style={{ background: "#ffffff", border: "1px solid #d1d5db", color: "#1a1a2e" }} />

            {password.length > 0 && (
              <div className="mt-2.5 space-y-2.5">
                <div className="flex items-center gap-2.5">
                  <div className="flex-1 flex gap-1">
                    <div className="h-1 rounded-full flex-1 transition-colors duration-200" style={{ background: strength === "weak" ? "#ef4444" : strength === "medium" ? "#f59e0b" : "#10b981" }} />
                    <div className="h-1 rounded-full flex-1 transition-colors duration-200" style={{ background: strength === "medium" ? "#f59e0b" : strength === "strong" ? "#10b981" : "#e5e7eb" }} />
                    <div className="h-1 rounded-full flex-1 transition-colors duration-200" style={{ background: strength === "strong" ? "#10b981" : "#e5e7eb" }} />
                  </div>
                  <span className="text-xs font-medium uppercase tracking-wider min-w-[52px] text-right" style={{ color: strength === "weak" ? "#ef4444" : strength === "medium" ? "#f59e0b" : "#10b981" }}>{strength}</span>
                </div>

                <ul className="space-y-1">
                  {passwordChecks.map((check) => (
                    <li key={check.key} className="flex items-center gap-2 text-xs">
                      {check.passed ? (
                        <svg className="w-3.5 h-3.5 flex-shrink-0" style={{ color: "#10b981" }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                      ) : (
                        <svg className="w-3.5 h-3.5 flex-shrink-0" style={{ color: "#d1d5db" }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><circle cx="12" cy="12" r="9" /></svg>
                      )}
                      <span style={{ color: check.passed ? "#6b7280" : "#9ca3af" }}>{check.label}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
          <button type="submit" disabled={loading || !allPassed} className="btn-primary py-3 mt-2">{loading ? "Creating..." : "Create Account"}</button>
        </form>

        <p className="text-sm text-center mt-8" style={{ color: "#9ca3af" }}>Already have an account?{" "}<Link href="/login" className="transition" style={{ color: "#8b5cf6" }}>Log in</Link></p>

        <div className="flex items-center justify-center gap-4 mt-6 text-xs" style={{ color: "#9ca3af" }}>
          <Link href="/privacy" className="hover:opacity-70 transition">Privacy</Link>
          <span>&middot;</span>
          <Link href="/terms" className="hover:opacity-70 transition">Terms</Link>
          <span>&middot;</span>
          <Link href="/content-policy" className="hover:opacity-70 transition">Content Policy</Link>
        </div>
      </div>
    </div>
  );
}

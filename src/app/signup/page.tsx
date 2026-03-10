"use client";

import { useState, useEffect, useMemo } from "react";
import { createClient } from "@/lib/supabase-browser";
import { useRouter } from "next/navigation";
import Link from "next/link";
import posthog from "posthog-js";

// ── Age gate inline styles (from whatupb-agegate.jsx) ─────────────────────

const ageGateStyles = `
  @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Sans:wght@300;400;500&display=swap');

  :root {
    --gate-bg: #0f0f18;
    --gate-surface: rgba(255,255,255,0.05);
    --gate-border: rgba(255,255,255,0.09);
    --gate-accent: #7c6aff;
    --gate-accent2: #ff6a9b;
    --gate-text: #f0eeff;
    --gate-muted: rgba(240,238,255,0.5);
  }

  .gate-wrap {
    min-height: 100vh;
    background: var(--gate-bg);
    display: flex;
    align-items: center;
    justify-content: center;
    font-family: 'DM Sans', sans-serif;
    position: relative;
    overflow: hidden;
  }

  .gate-wrap::before {
    content: '';
    position: fixed;
    inset: 0;
    background:
      radial-gradient(ellipse 70% 55% at 20% 50%, rgba(124,106,255,0.15) 0%, transparent 70%),
      radial-gradient(ellipse 50% 65% at 80% 30%, rgba(255,106,155,0.11) 0%, transparent 70%),
      radial-gradient(ellipse 60% 50% at 50% 90%, rgba(100,140,255,0.09) 0%, transparent 70%);
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
    opacity: 0.35;
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

  .msg-float {
    position: fixed;
    border: 1px solid rgba(255,255,255,0.06);
    background: rgba(255,255,255,0.03);
    backdrop-filter: blur(6px);
    border-radius: 14px;
    padding: 10px 14px;
    font-size: 12px;
    color: rgba(240,238,255,0.35);
    max-width: 200px;
    line-height: 1.4;
    pointer-events: none;
    z-index: 1;
    filter: blur(1px);
    opacity: 0;
    animation: floatIn 8s ease-in-out infinite;
  }

  .msg-float:nth-child(1) { top: 18%; left: 8%; animation-delay: 0s; }
  .msg-float:nth-child(2) { top: 35%; right: 7%; animation-delay: 2s; }
  .msg-float:nth-child(3) { bottom: 25%; left: 10%; animation-delay: 4s; }
  .msg-float:nth-child(4) { bottom: 20%; right: 9%; animation-delay: 6s; }

  @keyframes floatIn {
    0%, 100% { opacity: 0; transform: translateY(8px); }
    20%, 80% { opacity: 1; transform: translateY(0); }
  }

  .gate-card {
    position: relative;
    z-index: 10;
    width: 100%;
    max-width: 420px;
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
    background: rgba(124,106,255,0.12);
    border: 1px solid rgba(124,106,255,0.25);
    border-radius: 100px;
    padding: 5px 12px;
    font-size: 11px;
    font-weight: 500;
    color: #b3a8ff;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    margin-bottom: 20px;
    animation: cardUp 0.7s 0.1s cubic-bezier(0.16, 1, 0.3, 1) both;
  }

  .gate-badge-dot {
    width: 6px; height: 6px;
    border-radius: 50%;
    background: #7c6aff;
    animation: pulse 2s infinite;
  }

  @keyframes pulse {
    0%, 100% { opacity: 1; transform: scale(1); }
    50% { opacity: 0.5; transform: scale(0.7); }
  }

  .gate-headline {
    font-family: 'Bebas Neue', sans-serif;
    font-size: clamp(48px, 9vw, 68px);
    line-height: 0.95;
    color: var(--gate-text);
    letter-spacing: 0.01em;
    margin-bottom: 16px;
    animation: cardUp 0.7s 0.15s cubic-bezier(0.16, 1, 0.3, 1) both;
  }

  .gate-headline span {
    background: linear-gradient(135deg, #8b7bff, #ff7baa);
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

  .gate-features {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    margin-bottom: 20px;
    animation: cardUp 0.7s 0.25s cubic-bezier(0.16, 1, 0.3, 1) both;
  }

  .gate-feat {
    background: var(--gate-surface);
    border: 1px solid var(--gate-border);
    border-radius: 8px;
    padding: 6px 11px;
    font-size: 12px;
    color: var(--gate-muted);
    display: flex;
    align-items: center;
    gap: 6px;
  }

  .gate-example {
    background: rgba(124,106,255,0.06);
    border: 1px solid rgba(124,106,255,0.15);
    border-radius: 14px;
    padding: 14px 18px;
    margin-bottom: 28px;
    animation: cardUp 0.7s 0.28s cubic-bezier(0.16, 1, 0.3, 1) both;
  }

  .gate-example-label {
    font-size: 10px;
    font-weight: 500;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: rgba(179,168,255,0.6);
    margin-bottom: 6px;
  }

  .gate-example-text {
    font-size: 14px;
    color: rgba(240,238,255,0.65);
    line-height: 1.5;
    font-style: italic;
  }

  .gate-box {
    background: rgba(255,255,255,0.035);
    border: 1px solid var(--gate-border);
    border-radius: 20px;
    padding: 28px;
    animation: cardUp 0.7s 0.3s cubic-bezier(0.16, 1, 0.3, 1) both;
  }

  .gate-label {
    font-size: 11px;
    font-weight: 500;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: var(--gate-muted);
    margin-bottom: 14px;
  }

  .tap-btn {
    width: 100%;
    padding: 18px;
    background: linear-gradient(135deg, rgba(124,106,255,0.22), rgba(255,106,155,0.14));
    border: 1px solid rgba(124,106,255,0.3);
    border-radius: 14px;
    color: var(--gate-text);
    font-family: 'DM Sans', sans-serif;
    font-size: 16px;
    font-weight: 500;
    cursor: pointer;
    margin-bottom: 12px;
    transition: all 0.2s ease;
    position: relative;
    overflow: hidden;
  }

  .tap-btn::before {
    content: '';
    position: absolute;
    inset: 0;
    background: linear-gradient(135deg, rgba(124,106,255,0.3), rgba(255,106,155,0.2));
    opacity: 0;
    transition: opacity 0.2s;
  }

  .tap-btn:hover::before { opacity: 1; }
  .tap-btn:hover { transform: translateY(-1px); box-shadow: 0 8px 32px rgba(124,106,255,0.25); }
  .tap-btn:active { transform: translateY(0); }

  .tap-btn-text {
    position: relative;
    z-index: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
  }

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
    background: var(--gate-border);
  }

  .dob-row {
    display: grid;
    grid-template-columns: 2fr 1fr 1.5fr;
    gap: 8px;
    margin-bottom: 16px;
  }

  .dob-select {
    background: rgba(255,255,255,0.05);
    border: 1px solid var(--gate-border);
    border-radius: 10px;
    padding: 12px 10px;
    color: var(--gate-text);
    font-family: 'DM Sans', sans-serif;
    font-size: 14px;
    cursor: pointer;
    transition: border-color 0.2s;
    appearance: none;
    -webkit-appearance: none;
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='6' viewBox='0 0 10 6'%3E%3Cpath d='M1 1l4 4 4-4' stroke='rgba(240,238,255,0.4)' stroke-width='1.5' fill='none' stroke-linecap='round'/%3E%3C/svg%3E");
    background-repeat: no-repeat;
    background-position: right 10px center;
    padding-right: 28px;
  }

  .dob-select:focus {
    outline: none;
    border-color: rgba(124,106,255,0.5);
  }

  .dob-select option { background: #1a1a2e; color: var(--gate-text); }

  .verify-btn {
    width: 100%;
    padding: 15px;
    background: linear-gradient(135deg, #7c6aff, #9d6aff);
    border: none;
    border-radius: 12px;
    color: white;
    font-family: 'DM Sans', sans-serif;
    font-size: 15px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s ease;
    margin-bottom: 14px;
  }

  .verify-btn:hover:not(:disabled) {
    transform: translateY(-1px);
    box-shadow: 0 8px 24px rgba(124,106,255,0.4);
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
    opacity: 0.7;
  }

  .gate-helper {
    text-align: center;
    margin-top: 18px;
    font-size: 13px;
    color: rgba(240,238,255,0.4);
    animation: cardUp 0.7s 0.35s cubic-bezier(0.16, 1, 0.3, 1) both;
  }

  .gate-error-msg {
    background: rgba(255,80,80,0.1);
    border: 1px solid rgba(255,80,80,0.25);
    border-radius: 10px;
    padding: 10px 14px;
    font-size: 13px;
    color: #ff8080;
    margin-bottom: 14px;
    animation: shake 0.4s ease;
  }

  @keyframes shake {
    0%, 100% { transform: translateX(0); }
    25% { transform: translateX(-6px); }
    75% { transform: translateX(6px); }
  }

  .gate-success-overlay {
    position: fixed;
    inset: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-direction: column;
    gap: 16px;
    background: var(--gate-bg);
    z-index: 100;
    animation: fadeIn 0.4s ease;
  }

  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }

  .gate-success-icon {
    width: 64px; height: 64px;
    background: linear-gradient(135deg, #7c6aff, #ff6a9b);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 28px;
    color: white;
    animation: popIn 0.5s cubic-bezier(0.16, 1, 0.3, 1);
  }

  @keyframes popIn {
    from { transform: scale(0); }
    to { transform: scale(1); }
  }

  .gate-success-text {
    font-family: 'Bebas Neue', sans-serif;
    font-size: 36px;
    color: var(--gate-text);
    letter-spacing: 0.05em;
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
        setTimeout(() => { window.location.href = "/"; }, 3000);
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
    setTimeout(() => { setPhase("signup"); }, 1200);
  }

  async function handleTap() {
    const today = new Date();
    const dob: AgeData = {
      month: today.getMonth() + 1,
      day: today.getDate(),
      year: today.getFullYear() - 19,
    };
    await setAgeCookie(dob);
    handleAgeVerified(dob);
  }

  async function handleDobVerify() {
    const m = parseInt(dobMonth);
    const d = parseInt(dobDay);
    const y = parseInt(dobYear);
    const age = calculateAge(m, d, y);
    const dob: AgeData = { month: m, day: d, year: y };

    if (age < 18) {
      localStorage.setItem("whatupb_age_blocked", "1");
      document.cookie = "age_blocked_client=1; path=/; max-age=315360000; SameSite=Strict";
      setAgeCookie(dob);
      setAgeError("You must be 18 or older to enter WhatUPB.");
      setBlocked(true);
      setTimeout(() => { window.location.href = "/"; }, 3000);
    } else {
      await setAgeCookie(dob);
      handleAgeVerified(dob);
    }
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
        <div className="fixed inset-0 z-50 flex items-center justify-center px-6" style={{ background: "#0c0c10" }}>
          <div className="text-center max-w-md animate-rejection-fade-in">
            <div className="mb-6">
              <svg className="w-12 h-12 mx-auto text-denim-300 opacity-60" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
              </svg>
            </div>
            <p className="text-xl font-semibold text-foreground mb-3">Thanks for the interest!</p>
            <p className="text-zinc-500 text-sm leading-relaxed">Keep us in mind further down the road &mdash; we&apos;ll be here.</p>
          </div>
        </div>
      );
    }

    if (ageSuccess) {
      return (
        <>
          <style>{ageGateStyles}</style>
          <div className="gate-success-overlay">
            <div className="gate-success-icon">&#10003;</div>
            <div className="gate-success-text">Welcome In</div>
            <p style={{ color: "rgba(240,238,255,0.5)", fontSize: "14px" }}>Taking you to WhatUPB&hellip;</p>
          </div>
        </>
      );
    }

    return (
      <>
        <style>{ageGateStyles}</style>
        <div className="gate-wrap">
          <div className="msg-float">you&apos;re honestly one of my favorite people</div>
          <div className="msg-float">I wish I told you this sooner</div>
          <div className="msg-float">can we talk? for real this time</div>
          <div className="msg-float">you made my entire week and didn&apos;t even know it</div>

          <div className="gate-card">
            <div className="gate-badge">
              <div className="gate-badge-dot" />
              18+ Community
            </div>

            <h1 className="gate-headline">Ask anything.<br /><span>Get honest answers.</span></h1>

            <p className="gate-subtext">
              Create your page and let people send anonymous messages
              they&apos;d never say out loud. Fast to set up, simple to share,
              and fully anonymous.
            </p>

            <div className="gate-features">
              <div className="gate-feat">&#128123; 100% anonymous</div>
              <div className="gate-feat">&#128274; No data sold</div>
              <div className="gate-feat">&#10024; Real conversations</div>
            </div>

            <div className="gate-example">
              <div className="gate-example-label">Example message</div>
              <div className="gate-example-text">
                &ldquo;I think you inspire more people than you know.&rdquo;
              </div>
            </div>

            <div className="gate-box">
              <div className="gate-label">Enter WhatUPB</div>

              <button className="tap-btn" onClick={handleTap} type="button">
                <div className="tap-btn-text">
                  <span>&#10148;</span>
                  <span>Start my page</span>
                </div>
              </button>

              <div className="gate-divider">or enter your date of birth</div>

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

              {ageError && <div className="gate-error-msg">{ageError}</div>}

              <button className="verify-btn" onClick={handleDobVerify} disabled={!canSubmitDob} type="button">
                Verify &amp; Continue
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
    <div className="min-h-screen flex flex-col items-center justify-center px-4">
      <div className="w-full max-w-sm animate-welcome-glow">
        <div className="animate-fade-in-up">
          <div className="text-center mb-8">
            <Link href="/" className="text-2xl font-bold bg-gradient-to-r from-denim-200 to-white bg-clip-text text-transparent">WhatUPB</Link>
          </div>
          <h1 className="text-2xl font-bold mb-1 text-center tracking-tight">Create your link</h1>
          <p className="text-zinc-500 text-sm text-center mb-8">Takes 30 seconds. Start getting anonymous messages.</p>
        </div>

        {error && (
          <div className="flex items-start gap-3 bg-red-500/5 border border-red-500/20 text-red-300 px-4 py-3 rounded-xl mb-4 text-sm">
            <svg className="w-4 h-4 mt-0.5 flex-shrink-0 text-red-400" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            {errorCode === "EMAIL_EXISTS" ? (
              <span>This email is already in use. Try{" "}<Link href="/login" className="text-denim-200 hover:text-denim-100 underline transition">logging in</Link>{" "}or use a different email.</span>
            ) : (error)}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="text-xs font-medium uppercase tracking-wider text-zinc-500 mb-1.5 block">Username</label>
            <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} placeholder="yourname" required className="input" />
            <p className="text-xs text-zinc-600 mt-1.5">Your link will be{" "}<span className="text-denim-300 font-mono">whatupb.com/{username.toLowerCase() || "yourname"}</span></p>
          </div>
          <div>
            <label className="text-xs font-medium uppercase tracking-wider text-zinc-500 mb-1.5 block">Email</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@email.com" required className="input" />
          </div>
          <div>
            <label className="text-xs font-medium uppercase tracking-wider text-zinc-500 mb-1.5 block">Password</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Min 8 characters" required className="input" />

            {password.length > 0 && (
              <div className="mt-2.5 space-y-2.5">
                <div className="flex items-center gap-2.5">
                  <div className="flex-1 flex gap-1">
                    <div className="h-1 rounded-full flex-1 transition-colors duration-200" style={{ background: strength === "weak" ? "#ef4444" : strength === "medium" ? "#f59e0b" : "#10b981" }} />
                    <div className="h-1 rounded-full flex-1 transition-colors duration-200" style={{ background: strength === "medium" ? "#f59e0b" : strength === "strong" ? "#10b981" : "var(--surface-3)" }} />
                    <div className="h-1 rounded-full flex-1 transition-colors duration-200" style={{ background: strength === "strong" ? "#10b981" : "var(--surface-3)" }} />
                  </div>
                  <span className="text-xs font-medium uppercase tracking-wider min-w-[52px] text-right" style={{ color: strength === "weak" ? "#ef4444" : strength === "medium" ? "#f59e0b" : "#10b981" }}>{strength}</span>
                </div>

                <ul className="space-y-1">
                  {passwordChecks.map((check) => (
                    <li key={check.key} className="flex items-center gap-2 text-xs">
                      {check.passed ? (
                        <svg className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                      ) : (
                        <svg className="w-3.5 h-3.5 text-zinc-600 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><circle cx="12" cy="12" r="9" /></svg>
                      )}
                      <span className={check.passed ? "text-zinc-400" : "text-zinc-600"}>{check.label}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
          <button type="submit" disabled={loading || !allPassed} className="btn-primary py-3 mt-2">{loading ? "Creating..." : "Create Account"}</button>
        </form>

        <p className="text-zinc-600 text-sm text-center mt-8">Already have an account?{" "}<Link href="/login" className="text-denim-200 hover:text-denim-100 transition">Log in</Link></p>

        <div className="flex items-center justify-center gap-4 mt-6 text-xs text-zinc-600">
          <Link href="/privacy" className="hover:text-zinc-400 transition">Privacy</Link>
          <span className="text-zinc-700">&middot;</span>
          <Link href="/terms" className="hover:text-zinc-400 transition">Terms</Link>
          <span className="text-zinc-700">&middot;</span>
          <Link href="/content-policy" className="hover:text-zinc-400 transition">Content Policy</Link>
        </div>
      </div>
    </div>
  );
}

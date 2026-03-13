"use client";

import { useState, useCallback } from "react";
import { createClient } from "@/lib/supabase-browser";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/toast";

type Filter = { id: string; keyword: string };

const THEME_OPTIONS: { value: string; label: string; dot: React.CSSProperties }[] = [
  { value: "dark", label: "Dark", dot: { background: "#0D0B1A" } },
  { value: "light", label: "Light", dot: { background: "linear-gradient(135deg, #F4F3F8, #E8E6F4)", border: "1px solid rgba(155,142,232,0.2)" } },
  { value: "purple", label: "Light Purple", dot: { background: "linear-gradient(135deg, #C4BBF5, #9B8EE8)" } },
];

type PlanKey = "weekly" | "monthly" | "yearly";

const PLANS: { key: PlanKey; label: string; price: string; period: string; badge?: string; savings?: string }[] = [
  { key: "weekly", label: "Weekly", price: "$0.99", period: "/week" },
  { key: "monthly", label: "Monthly", price: "$4.99", period: "/month" },
  { key: "yearly", label: "Yearly", price: "$39.99", period: "/year", badge: "Best value", savings: "Save 33%" },
];

function Toggle({ checked, onChange, disabled }: { checked: boolean; onChange: () => void; disabled?: boolean }) {
  return (
    <div
      onClick={disabled ? undefined : onChange}
      role="switch"
      aria-checked={checked}
      style={{
        position: "relative", width: "44px", height: "26px",
        borderRadius: "50px", cursor: disabled ? "default" : "pointer", flexShrink: 0,
        background: checked ? "#9B8EE8" : "rgba(26,23,48,0.15)",
        transition: "background 0.2s",
        opacity: disabled ? 0.6 : 1,
      }}
    >
      <div style={{
        position: "absolute", top: "3px",
        left: checked ? "21px" : "3px",
        width: "20px", height: "20px", borderRadius: "50%",
        background: "#fff", boxShadow: "0 1px 4px rgba(0,0,0,0.2)",
        transition: "left 0.2s",
      }} />
    </div>
  );
}

export default function SettingsClient({
  username,
  isPremium,
  premiumExpiresAt,
  linkTheme,
  initialFilters,
  currentPlan,
  emailNotifications: initialEmailNotifications,
}: {
  username: string;
  isPremium: boolean;
  premiumExpiresAt: string | null;
  linkTheme: string;
  initialFilters: Filter[];
  currentPlan: PlanKey | null;
  emailNotifications: boolean;
}) {
  const [copied, setCopied] = useState(false);
  const [generatingCard, setGeneratingCard] = useState(false);
  const [checkingOut, setCheckingOut] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<PlanKey>("yearly");
  const [changingPlan, setChangingPlan] = useState(false);
  const [filters, setFilters] = useState<Filter[]>(initialFilters);
  const [filterInput, setFilterInput] = useState("");
  const [savingFilters, setSavingFilters] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [selectedTheme, setSelectedTheme] = useState(linkTheme);
  const [savingTheme, setSavingTheme] = useState(false);
  const [emailNotifs, setEmailNotifs] = useState(initialEmailNotifications);
  const [savingNotifs, setSavingNotifs] = useState(false);
  const router = useRouter();
  const supabase = createClient();
  const { toast } = useToast();

  const profileUrl = `https://whatupb.com/${username}`;

  function handleCopy() {
    navigator.clipboard.writeText(profileUrl);
    setCopied(true);
    toast("Link copied to clipboard!");
    setTimeout(() => setCopied(false), 2000);
  }

  async function handleNativeShare() {
    if (typeof navigator !== "undefined" && typeof navigator.share === "function") {
      try {
        await navigator.share({
          title: "Send me anonymous messages!",
          text: "Send me an anonymous message on WhatUPB",
          url: profileUrl,
        });
        toast("Shared!");
        return;
      } catch {
        // User cancelled or share failed
      }
    }
    handleCopy();
  }

  function handleShareTwitter() {
    const text = encodeURIComponent(
      `Send me an anonymous message! \u{1F440}\n${profileUrl}`
    );
    window.open(`https://twitter.com/intent/tweet?text=${text}`, "_blank");
  }

  function handleShareInstagram() {
    navigator.clipboard.writeText(profileUrl);
    toast("Link copied! Paste it in your Instagram bio or story.", "info");
  }

  const handleStoryCard = useCallback(async () => {
    setGeneratingCard(true);
    try {
      const res = await fetch(
        `/api/story-card?username=${encodeURIComponent(username)}`
      );
      if (!res.ok) throw new Error(`Server returned ${res.status}`);
      const blob = await res.blob();
      const file = new File([blob], `whatupb-${username}.png`, {
        type: "image/png",
      });
      if (
        typeof navigator.canShare === "function" &&
        navigator.canShare({ files: [file] })
      ) {
        try {
          await navigator.share({
            title: "WhatUPB",
            text: `Send me anonymous messages! ${profileUrl}`,
            files: [file],
          });
          toast("Shared!");
          return;
        } catch {
          // Fall through to download
        }
      }
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `whatupb-${username}.png`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
      await navigator.clipboard.writeText(profileUrl);
      toast(
        "Story card downloaded! Link copied \u2014 open Instagram \u2192 Add to Story \u2192 upload the image.",
        "info"
      );
    } catch {
      toast("Failed to generate story card. Try again.", "error");
    } finally {
      setGeneratingCard(false);
    }
  }, [username, profileUrl, toast]);

  async function handleUpgrade() {
    setCheckingOut(true);
    try {
      const res = await fetch("/api/create-checkout-session", {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-csrf-protection": "1" },
        body: JSON.stringify({ plan: selectedPlan }),
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        toast(data.error || "Failed to start checkout.", "error");
      }
    } catch {
      toast("Failed to start checkout. Try again.", "error");
    } finally {
      setCheckingOut(false);
    }
  }

  async function handleChangePlan(plan: PlanKey) {
    setChangingPlan(true);
    try {
      const res = await fetch("/api/change-plan", {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-csrf-protection": "1" },
        body: JSON.stringify({ plan }),
      });
      const data = await res.json();
      if (res.ok) {
        toast("Plan updated! Changes take effect immediately.");
        router.refresh();
      } else {
        toast(data.error || "Failed to change plan.", "error");
      }
    } catch {
      toast("Failed to change plan. Try again.", "error");
    } finally {
      setChangingPlan(false);
    }
  }

  async function handleAddFilters() {
    const keywords = filterInput
      .split(",")
      .map((k) => k.trim().toLowerCase())
      .filter((k) => k.length > 0);
    if (keywords.length === 0) return;

    setSavingFilters(true);
    try {
      const res = await fetch("/api/filters", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ keywords }),
      });
      const data = await res.json();
      if (res.ok) {
        setFilters((prev) => {
          const existingIds = new Set(prev.map((f) => f.id));
          const newFilters = (data.filters || []).filter(
            (f: Filter) => !existingIds.has(f.id)
          );
          return [...prev, ...newFilters];
        });
        setFilterInput("");
        toast("Filters saved!");
      } else {
        toast(data.error || "Failed to save filters.", "error");
      }
    } catch {
      toast("Failed to save filters.", "error");
    } finally {
      setSavingFilters(false);
    }
  }

  async function handleRemoveFilter(id: string) {
    setFilters((prev) => prev.filter((f) => f.id !== id));
    try {
      const res = await fetch(`/api/filters?id=${id}`, { method: "DELETE" });
      if (!res.ok) {
        toast("Failed to remove filter.", "error");
        const refetch = await fetch("/api/filters");
        if (refetch.ok) {
          const data = await refetch.json();
          setFilters(data.filters || []);
        }
      }
    } catch {
      toast("Failed to remove filter.", "error");
    }
  }

  async function handleThemeChange(theme: string) {
    setSelectedTheme(theme);
    setSavingTheme(true);
    try {
      const { error } = await supabase
        .from("profiles")
        .update({ link_theme: theme })
        .eq("username", username);
      if (error) {
        toast("Failed to save theme.", "error");
      } else {
        toast("Theme updated!");
      }
    } catch {
      toast("Failed to save theme.", "error");
    } finally {
      setSavingTheme(false);
    }
  }

  async function handleToggleEmailNotifs() {
    const newVal = !emailNotifs;
    setEmailNotifs(newVal);
    setSavingNotifs(true);
    try {
      const { error } = await supabase
        .from("profiles")
        .update({ email_notifications: newVal })
        .eq("username", username);
      if (error) {
        setEmailNotifs(!newVal);
        toast("Failed to update notification preference.", "error");
      } else {
        toast(newVal ? "Email notifications enabled." : "Email notifications disabled.");
      }
    } catch {
      setEmailNotifs(!newVal);
      toast("Failed to update notification preference.", "error");
    } finally {
      setSavingNotifs(false);
    }
  }

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  }

  const sLabel: React.CSSProperties = { fontSize: "10px", letterSpacing: "2.5px", textTransform: "uppercase" as const, color: "#9B8EE8", fontWeight: 600, marginBottom: "4px", fontFamily: "var(--font-ibm-plex-mono), 'IBM Plex Mono', monospace" };
  const sDesc: React.CSSProperties = { fontSize: "13px", color: "rgba(26,23,48,0.42)", lineHeight: 1.5, marginBottom: "16px" };

  return (
    <div>
      {/* YOUR LINK */}
      <div className="anim-2 settings-card" style={{ textAlign: "center" }}>
        <div style={sLabel}>Your Link</div>
        <div style={{ background: "#EDEAF4", border: "1px solid rgba(190,182,220,0.55)", borderRadius: "14px", padding: "20px 20px 6px", textAlign: "center", boxShadow: "0 2px 8px rgba(100,90,160,0.08), inset 0 1px 0 rgba(255,255,255,0.7)" }}>
          <div style={{ fontSize: "10px", letterSpacing: "2.5px", textTransform: "uppercase" as const, color: "rgba(26,23,48,0.35)", marginBottom: "10px" }}>Your personal link</div>
          <div style={{ fontFamily: "var(--font-playfair), 'Playfair Display', serif", fontSize: "20px", fontWeight: 700, letterSpacing: "-0.3px", lineHeight: 1.3, marginBottom: "4px" }}>
            <span style={{ color: "rgba(26,23,48,0.28)" }}>whatupb.com/</span>
            <span style={{ color: "#9B8EE8" }}>{username}</span>
          </div>
          <div style={{ fontSize: "12px", color: "rgba(26,23,48,0.32)", marginBottom: "18px" }}>This is your personal link &mdash; share it anywhere.</div>
          <button onClick={handleCopy} style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", margin: "0 auto 16px", padding: "11px 26px", borderRadius: "50px", border: "none", cursor: "pointer", fontFamily: "var(--font-lora), 'Lora', Georgia, serif", fontSize: "14px", fontWeight: 600, color: "#fff", background: copied ? "#6EBD9A" : "#9B8EE8", boxShadow: "0 4px 14px rgba(155,142,232,0.4)", transition: "all 0.2s" }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" /><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" /></svg>
            {copied ? "\u2713 Copied!" : "Copy Link"}
          </button>
        </div>
      </div>

      {/* SHARE YOUR LINK */}
      <div className="anim-3 settings-card">
        <div style={sLabel}>Share Your Link</div>
        <div style={sDesc}>whatupb.com/{username}</div>
        <button onClick={handleNativeShare} style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "9px", width: "100%", padding: "14px", borderRadius: "12px", border: "none", cursor: "pointer", fontFamily: "var(--font-lora), 'Lora', Georgia, serif", fontSize: "15px", fontWeight: 600, color: "#fff", background: "linear-gradient(135deg, #9B8EE8 0%, #7C6FCC 100%)", boxShadow: "0 4px 16px rgba(124,111,204,0.4), inset 0 1px 0 rgba(255,255,255,0.2)", transition: "all 0.2s", marginBottom: "10px" }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><circle cx="18" cy="5" r="3" /><circle cx="6" cy="12" r="3" /><circle cx="18" cy="19" r="3" /><line x1="8.59" y1="13.51" x2="15.42" y2="17.49" /><line x1="15.41" y1="6.51" x2="8.59" y2="10.49" /></svg>
          Share My Link
        </button>
        <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
          <button onClick={handleShareTwitter} className="settings-platform-btn" type="button">
            <svg width="18" height="18" fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" /></svg>
            X
          </button>
          <button onClick={handleShareInstagram} className="settings-platform-btn" type="button">
            <svg width="18" height="18" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" /></svg>
            Instagram
          </button>
          <button onClick={handleCopy} className="settings-platform-btn" type="button">
            <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><rect x="9" y="9" width="13" height="13" rx="2" /><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" /></svg>
            Copy
          </button>
        </div>
        <div style={{ marginTop: "10px", fontSize: "11px", color: "rgba(26,23,48,0.45)", lineHeight: "1.4", textAlign: "center" }}>
          {"\u26A0\uFE0F"} Post publicly only &mdash; sharing your link privately removes sender anonymity and defeats the purpose of WhatUPB.
        </div>
      </div>

      {/* INSTAGRAM STORY */}
      <div className="anim-4 settings-card">
        <div style={sLabel}>Instagram Story</div>
        <div style={sDesc}>Generate a story card image to share on Instagram or any platform.</div>
        <button onClick={handleStoryCard} disabled={generatingCard} style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", width: "100%", padding: "13px", borderRadius: "12px", border: "1px solid rgba(180,175,205,0.5)", background: "#fff", cursor: generatingCard ? "default" : "pointer", fontFamily: "var(--font-lora), 'Lora', Georgia, serif", fontSize: "14px", fontWeight: 500, color: "#3D3860", transition: "all 0.2s", boxShadow: "0 2px 6px rgba(100,90,160,0.07)", opacity: generatingCard ? 0.6 : 1 }}>
          {generatingCard ? (
            <>
              <svg width="16" height="16" fill="none" viewBox="0 0 24 24" className="animate-spin"><circle style={{ opacity: 0.25 }} cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path style={{ opacity: 0.75 }} fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>
              Generating...
            </>
          ) : (
            <>{"\uD83D\uDCF8"} Generate Story Card</>
          )}
        </button>
      </div>

      {/* PLAN */}
      <div className="anim-5 settings-card">
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "12px", marginBottom: "4px" }}>
          <div>
            <div style={sLabel}>Plan</div>
            <div style={{ fontFamily: "var(--font-playfair), 'Playfair Display', serif", fontSize: "16px", fontWeight: 700, color: "#1A1730", marginBottom: "4px" }}>
              {isPremium ? "Premium" : "Free"}
            </div>
          </div>
          {isPremium && currentPlan ? (
            <div style={{ display: "inline-flex", alignItems: "center", gap: "5px", padding: "4px 12px", borderRadius: "50px", background: "rgba(155,142,232,0.12)", border: "1px solid rgba(155,142,232,0.25)", fontSize: "11px", fontWeight: 600, color: "#9B8EE8", letterSpacing: "0.3px" }}>
              {"\u2726"} Premium &middot; {currentPlan.charAt(0).toUpperCase() + currentPlan.slice(1)}
            </div>
          ) : isPremium ? (
            <div style={{ display: "inline-flex", alignItems: "center", gap: "5px", padding: "4px 12px", borderRadius: "50px", background: "rgba(155,142,232,0.12)", border: "1px solid rgba(155,142,232,0.25)", fontSize: "11px", fontWeight: 600, color: "#9B8EE8", letterSpacing: "0.3px" }}>
              {"\u2726"} Premium
            </div>
          ) : (
            <div style={{ display: "inline-flex", alignItems: "center", padding: "4px 12px", borderRadius: "50px", background: "rgba(26,23,48,0.06)", border: "1px solid rgba(26,23,48,0.1)", fontSize: "11px", fontWeight: 600, color: "rgba(26,23,48,0.42)", letterSpacing: "0.3px" }}>
              Free
            </div>
          )}
        </div>

        {isPremium ? (
          <div>
            <div style={sDesc}>Unlimited message history, keyword filters, custom themes.</div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "8px", marginBottom: "16px" }}>
              {PLANS.map((plan) => {
                const isActive = plan.key === currentPlan;
                const isDowngrade = currentPlan === "yearly" && plan.key !== "yearly";
                const isUpgrade =
                  (currentPlan === "weekly" && plan.key !== "weekly") ||
                  (currentPlan === "monthly" && plan.key === "yearly");
                const canSwitch = !isActive && !isDowngrade;

                return (
                  <button
                    key={plan.key}
                    type="button"
                    onClick={canSwitch ? () => handleChangePlan(plan.key) : undefined}
                    disabled={!canSwitch || changingPlan}
                    style={{
                      position: "relative",
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      padding: "16px 10px",
                      borderRadius: "14px",
                      border: isActive
                        ? "2px solid #9B8EE8"
                        : "1.5px solid rgba(190,185,215,0.4)",
                      background: isActive
                        ? "linear-gradient(135deg, #faf9ff 0%, #f0edff 100%)"
                        : "#fff",
                      cursor: canSwitch && !changingPlan ? "pointer" : "default",
                      transition: "all 0.2s",
                      opacity: isDowngrade ? 0.55 : changingPlan && canSwitch ? 0.6 : 1,
                      boxShadow: isActive
                        ? "0 4px 18px rgba(155,142,232,0.25), 0 8px 28px rgba(155,142,232,0.12)"
                        : "0 2px 8px rgba(100,90,160,0.07)",
                    }}
                  >
                    {isActive && (
                      <span style={{ position: "absolute", top: "-10px", left: "50%", transform: "translateX(-50%)", fontSize: "10px", fontWeight: 700, textTransform: "uppercase" as const, letterSpacing: "0.5px", padding: "2px 10px", borderRadius: "50px", background: "linear-gradient(135deg, #9B8EE8, #7C6FCC)", color: "#fff", whiteSpace: "nowrap" }}>
                        Current Plan
                      </span>
                    )}
                    {!isActive && plan.badge && (
                      <span style={{ position: "absolute", top: "-10px", left: "50%", transform: "translateX(-50%)", fontSize: "10px", fontWeight: 700, textTransform: "uppercase" as const, letterSpacing: "0.5px", padding: "2px 8px", borderRadius: "50px", background: isDowngrade ? "rgba(26,23,48,0.15)" : "linear-gradient(135deg, #9B8EE8, #7C6FCC)", color: "#fff", whiteSpace: "nowrap" }}>
                        {plan.badge}
                      </span>
                    )}
                    <span style={{ fontSize: "12px", color: isActive ? "#9B8EE8" : "rgba(26,23,48,0.42)", marginBottom: "4px", marginTop: (isActive || plan.badge) ? "4px" : 0, fontWeight: isActive ? 600 : 400 }}>{plan.label}</span>
                    <span style={{ fontSize: "18px", fontWeight: 700, color: isActive ? "#1A1730" : isDowngrade ? "rgba(26,23,48,0.4)" : "#1A1730" }}>{plan.price}</span>
                    <span style={{ fontSize: "12px", color: isActive ? "rgba(26,23,48,0.55)" : "rgba(26,23,48,0.42)" }}>{plan.period}</span>
                    {plan.savings && (
                      <span style={{ fontSize: "10px", color: isDowngrade ? "rgba(26,23,48,0.3)" : "#10b981", fontWeight: 500, marginTop: "2px" }}>{plan.savings}</span>
                    )}
                    {isActive && premiumExpiresAt && (
                      <div style={{ marginTop: "8px", textAlign: "center" }}>
                        <div style={{ fontSize: "10px", fontWeight: 600, color: "#9B8EE8", marginBottom: "2px" }}>
                          Renews {new Date(premiumExpiresAt).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
                        </div>
                        <div style={{ fontSize: "9.5px", color: "rgba(26,23,48,0.42)" }}>Auto-renew is on</div>
                      </div>
                    )}
                    {!isActive && isUpgrade && (
                      <span style={{ fontSize: "10px", fontWeight: 600, marginTop: "6px", padding: "2px 8px", borderRadius: "50px", background: "rgba(155,142,232,0.1)", color: "#9B8EE8" }}>
                        Upgrade
                      </span>
                    )}
                    {isDowngrade && (
                      <span style={{ fontSize: "9px", color: "rgba(26,23,48,0.4)", marginTop: "6px", textAlign: "center", lineHeight: 1.3 }}>
                        Available after current billing period
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            {currentPlan && (
              <div style={{ padding: "14px 16px", borderRadius: "12px", border: "1px solid rgba(155,142,232,0.18)", background: "rgba(155,142,232,0.04)" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "6px" }}>
                  <span style={{ fontSize: "13px", color: "rgba(26,23,48,0.55)" }}>
                    {currentPlan.charAt(0).toUpperCase() + currentPlan.slice(1)} Plan Active
                  </span>
                  <span style={{ fontSize: "13px", fontWeight: 600, color: "#9B8EE8" }}>
                    {premiumExpiresAt
                      ? `Renews ${new Date(premiumExpiresAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}`
                      : "Active"}
                  </span>
                </div>
                {currentPlan === "yearly" && (
                  <div style={{ fontSize: "12px", color: "rgba(26,23,48,0.35)", marginBottom: "4px" }}>
                    Downgrades to Weekly or Monthly are available when your yearly term ends.
                  </div>
                )}
                <div style={{ fontSize: "12px", color: "rgba(26,23,48,0.35)" }}>To manage payment methods or cancel, visit your Stripe billing portal.</div>
              </div>
            )}
          </div>
        ) : (
          <div>
            <div style={sDesc}>Unlock unlimited history, keyword filters, and custom link themes.</div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "8px", marginBottom: "16px" }}>
              {PLANS.map((plan) => (
                <button
                  key={plan.key}
                  type="button"
                  onClick={() => setSelectedPlan(plan.key)}
                  style={{ position: "relative", display: "flex", flexDirection: "column", alignItems: "center", padding: "14px 10px", borderRadius: "14px", border: selectedPlan === plan.key ? "1.5px solid #9B8EE8" : "1.5px solid rgba(190,185,215,0.4)", cursor: "pointer", transition: "all 0.2s", background: selectedPlan === plan.key ? "#faf9ff" : "#fff", boxShadow: selectedPlan === plan.key ? "0 4px 14px rgba(155,142,232,0.2), 0 8px 24px rgba(155,142,232,0.1)" : "0 2px 8px rgba(100,90,160,0.07)" }}
                >
                  {plan.badge && (
                    <span style={{ position: "absolute", top: "-10px", left: "50%", transform: "translateX(-50%)", fontSize: "10px", fontWeight: 700, textTransform: "uppercase" as const, letterSpacing: "0.5px", padding: "2px 8px", borderRadius: "50px", background: "linear-gradient(135deg, #9B8EE8, #7C6FCC)", color: "#fff", whiteSpace: "nowrap" }}>
                      {plan.badge}
                    </span>
                  )}
                  <span style={{ fontSize: "12px", color: "rgba(26,23,48,0.42)", marginBottom: "4px", marginTop: plan.badge ? "4px" : 0 }}>{plan.label}</span>
                  <span style={{ fontSize: "18px", fontWeight: 700, color: "#1A1730" }}>{plan.price}</span>
                  <span style={{ fontSize: "12px", color: "rgba(26,23,48,0.42)" }}>{plan.period}</span>
                  {plan.savings && (
                    <span style={{ fontSize: "10px", color: "#10b981", fontWeight: 500, marginTop: "2px" }}>{plan.savings}</span>
                  )}
                </button>
              ))}
            </div>

            <button onClick={handleUpgrade} disabled={checkingOut} style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", width: "100%", padding: "14px", borderRadius: "12px", border: "none", cursor: checkingOut ? "default" : "pointer", fontFamily: "var(--font-lora), 'Lora', Georgia, serif", fontSize: "15px", fontWeight: 600, color: "#fff", background: "linear-gradient(135deg, #9B8EE8 0%, #7C6FCC 100%)", boxShadow: "0 4px 16px rgba(124,111,204,0.4), inset 0 1px 0 rgba(255,255,255,0.2)", transition: "all 0.2s", opacity: checkingOut ? 0.6 : 1 }}>
              <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
              {checkingOut
                ? "Redirecting..."
                : `Upgrade \u2014 ${selectedPlan === "weekly" ? "$0.99/wk" : selectedPlan === "monthly" ? "$4.99/mo" : "$39.99/yr"}`}
            </button>
          </div>
        )}
      </div>

      {/* KEYWORD FILTERS (Premium) */}
      {isPremium && (
        <div className="anim-6 settings-card">
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "4px" }}>
            <div style={sLabel}>Keyword Filters</div>
            <button onClick={() => setShowFilters(!showFilters)} type="button" style={{ fontSize: "12px", color: "#9B8EE8", background: "none", border: "none", cursor: "pointer", fontWeight: 500 }}>
              {showFilters ? "Hide" : "Manage"}
            </button>
          </div>
          <div style={sDesc}>
            Block messages containing specific words.{" "}
            {filters.length > 0 && (
              <span style={{ color: "rgba(26,23,48,0.55)" }}>
                {filters.length} active filter{filters.length !== 1 && "s"}
              </span>
            )}
          </div>

          {showFilters && (
            <div>
              <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                <input
                  type="text"
                  value={filterInput}
                  onChange={(e) => setFilterInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleAddFilters();
                    }
                  }}
                  placeholder="word1, word2, word3..."
                  disabled={savingFilters}
                  style={{ flex: 1, padding: "12px 15px", borderRadius: "11px", border: "1px solid rgba(155,142,232,0.18)", background: "rgba(255,255,255,0.8)", fontFamily: "var(--font-lora), 'Lora', Georgia, serif", fontSize: "14px", color: "#1A1730", outline: "none", transition: "all 0.2s" }}
                />
                <button onClick={handleAddFilters} disabled={savingFilters || filterInput.trim().length === 0} type="button" style={{ padding: "12px 22px", borderRadius: "11px", border: "none", cursor: "pointer", background: "#9B8EE8", color: "#fff", fontFamily: "var(--font-lora), 'Lora', Georgia, serif", fontSize: "14px", fontWeight: 600, transition: "all 0.2s", whiteSpace: "nowrap", opacity: (savingFilters || filterInput.trim().length === 0) ? 0.6 : 1 }}>
                  {savingFilters ? "..." : "Add"}
                </button>
              </div>

              {filters.length > 0 && (
                <div style={{ display: "flex", gap: "6px", flexWrap: "wrap", marginTop: "12px" }}>
                  {filters.map((f) => (
                    <div key={f.id} style={{ display: "inline-flex", alignItems: "center", gap: "6px", padding: "5px 12px", borderRadius: "50px", background: "rgba(155,142,232,0.08)", border: "1px solid rgba(155,142,232,0.18)", fontSize: "12.5px", color: "#3D3860" }}>
                      {f.keyword}
                      <span onClick={() => handleRemoveFilter(f.id)} style={{ cursor: "pointer", color: "rgba(26,23,48,0.42)", fontSize: "11px" }}>{"\u2715"}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* THEME (Premium) */}
      {isPremium && (
        <div className="anim-6 settings-card">
          <div style={sLabel}>Link Page Theme</div>
          <div style={{ ...sDesc, marginBottom: "18px" }}>Choose how your profile page looks to visitors.</div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "10px" }}>
            {THEME_OPTIONS.map((t) => (
              <div
                key={t.value}
                onClick={() => handleThemeChange(t.value)}
                style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "8px", padding: "14px 10px", borderRadius: "14px", border: selectedTheme === t.value ? "1.5px solid #9B8EE8" : "1.5px solid rgba(190,185,215,0.4)", cursor: savingTheme ? "default" : "pointer", transition: "all 0.2s", background: selectedTheme === t.value ? "#faf9ff" : "#fff", boxShadow: selectedTheme === t.value ? "0 4px 14px rgba(155,142,232,0.2), 0 8px 24px rgba(155,142,232,0.1)" : "0 2px 8px rgba(100,90,160,0.07)", opacity: savingTheme ? 0.7 : 1 }}
              >
                <div style={{ width: "40px", height: "40px", borderRadius: "50%", boxShadow: "0 2px 8px rgba(0,0,0,0.12)", display: "flex", alignItems: "center", justifyContent: "center", position: "relative", ...t.dot }}>
                  {selectedTheme === t.value && <span style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "15px", fontWeight: 700, color: "#fff" }}>{"\u2713"}</span>}
                </div>
                <div style={{ fontSize: "12.5px", fontWeight: selectedTheme === t.value ? 600 : 500, color: selectedTheme === t.value ? "#9B8EE8" : "#3D3860" }}>{t.label}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ACCOUNT */}
      <div className="anim-7 settings-card">
        <div style={sLabel}>Account</div>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 0", borderBottom: "1px solid rgba(26,23,48,0.09)" }}>
          <div style={{ fontSize: "14px", color: "#3D3860" }}>Logged in as</div>
          <div style={{ fontSize: "14px", color: "#9B8EE8", fontWeight: 500 }}>@{username}</div>
        </div>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 0" }}>
          <div>
            <div style={{ fontSize: "14px", color: "#3D3860" }}>Email Notifications</div>
            <div style={{ fontSize: "12px", color: "rgba(26,23,48,0.42)", marginTop: "2px" }}>Get notified when you receive a message</div>
          </div>
          <Toggle checked={emailNotifs} onChange={handleToggleEmailNotifs} disabled={savingNotifs} />
        </div>
        <button onClick={handleLogout} style={{ display: "block", width: "100%", padding: "13px", borderRadius: "12px", border: "1px solid rgba(229,115,115,0.25)", background: "rgba(229,115,115,0.05)", cursor: "pointer", fontFamily: "var(--font-lora), 'Lora', Georgia, serif", fontSize: "15px", fontWeight: 500, color: "#C62828", transition: "all 0.2s", marginTop: "14px" }}>
          Log Out
        </button>
      </div>
    </div>
  );
}

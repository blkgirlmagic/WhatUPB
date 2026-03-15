/**
 * Theme CSS variable overrides.
 * Maps the saved `link_theme` value to CSS custom property overrides
 * that cascade to every child element via inline style.
 *
 * These override both the component-level vars (--background, --surface-*)
 * AND the landing-page vars (--bg, --ink, --muted, --lav, --faint, etc.)
 * so themes work correctly on the public profile page.
 */
export const THEMES: Record<string, Record<string, string>> = {
  dark: {
    /* Dark theme: dark navy background, white text */
    "--bg": "#1a1a2e",
    "--bg2": "#2a2a3e",
    "--ink": "#ffffff",
    "--ink2": "#e0e0e0",
    "--muted": "rgba(255,255,255,0.55)",
    "--faint": "rgba(255,255,255,0.12)",
    "--lav": "#7c3aed",
    "--lav-dark": "#6d28d9",
    "--lav-light": "#a78bfa",
    "--lav-glow": "rgba(124,58,237,0.18)",
    "--glass-bg": "rgba(42,42,62,0.55)",
    "--glass-border": "rgba(255,255,255,0.15)",
    "--line-col": "rgba(201,168,76,0.18)",
    "--line-bright": "rgba(201,168,76,0.32)",
    "--background": "#1a1a2e",
    "--foreground": "#ededed",
    "--surface-1": "rgba(255,255,255,0.06)",
    "--surface-2": "rgba(255,255,255,0.10)",
    "--surface-3": "rgba(255,255,255,0.15)",
    "--border-subtle": "rgba(255,255,255,0.10)",
    "--border-default": "rgba(255,255,255,0.18)",
  },
  light: {
    /* Light theme: white background, dark text */
    "--bg": "#ffffff",
    "--bg2": "#f5f5f5",
    "--ink": "#1a1a2e",
    "--ink2": "#3D3860",
    "--muted": "rgba(26,26,46,0.55)",
    "--faint": "rgba(26,26,46,0.12)",
    "--lav": "#7c3aed",
    "--lav-dark": "#6d28d9",
    "--lav-light": "#a78bfa",
    "--lav-glow": "rgba(124,58,237,0.18)",
    "--glass-bg": "rgba(245,245,245,0.7)",
    "--glass-border": "rgba(0,0,0,0.08)",
    "--line-col": "rgba(201,168,76,0.18)",
    "--line-bright": "rgba(201,168,76,0.32)",
    "--background": "#ffffff",
    "--foreground": "#1a1a2e",
    "--surface-1": "rgba(0, 0, 0, 0.04)",
    "--surface-2": "rgba(0, 0, 0, 0.07)",
    "--surface-3": "rgba(0, 0, 0, 0.10)",
    "--border-subtle": "rgba(0, 0, 0, 0.10)",
    "--border-default": "rgba(0, 0, 0, 0.18)",
  },
  purple: {
    /* Light Purple theme: soft purple background, dark purple text */
    "--bg": "#ede9f6",
    "--bg2": "#e0daf0",
    "--ink": "#3b1f6e",
    "--ink2": "#5a3d8a",
    "--muted": "rgba(59,31,110,0.55)",
    "--faint": "rgba(59,31,110,0.12)",
    "--lav": "#7c3aed",
    "--lav-dark": "#6d28d9",
    "--lav-light": "#a78bfa",
    "--lav-glow": "rgba(124,58,237,0.18)",
    "--glass-bg": "rgba(255,255,255,0.65)",
    "--glass-border": "rgba(124,58,237,0.15)",
    "--line-col": "rgba(201,168,76,0.18)",
    "--line-bright": "rgba(201,168,76,0.32)",
    "--background": "#ede9f6",
    "--foreground": "#3b1f6e",
    "--surface-1": "#ffffff",
    "--surface-2": "rgba(124,58,237,0.08)",
    "--surface-3": "rgba(124,58,237,0.12)",
    "--border-subtle": "rgba(124,58,237,0.12)",
    "--border-default": "rgba(124,58,237,0.25)",
  },
};

/** Resolve theme name + CSS vars from a raw DB value. */
export function resolveTheme(raw: string | null | undefined) {
  const name = raw ?? "dark";
  return { name, vars: THEMES[name] ?? THEMES.dark };
}

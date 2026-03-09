/**
 * Theme CSS variable overrides.
 * Maps the saved `link_theme` value to CSS custom property overrides
 * that cascade to every child element via inline style.
 */
export const THEMES: Record<string, Record<string, string>> = {
  dark: {
    /* Uses the global :root defaults — no overrides needed */
  },
  light: {
    "--background": "#f8f8f8",
    "--foreground": "#1a1a2e",
    "--denim-200": "#6a5a96",
    "--denim-300": "#7a6aa6",
    "--denim-400": "#6a5a96",
    "--denim-500": "#5a4a86",
    "--surface-1": "rgba(0, 0, 0, 0.04)",
    "--surface-2": "rgba(0, 0, 0, 0.07)",
    "--surface-3": "rgba(0, 0, 0, 0.10)",
    "--border-subtle": "rgba(0, 0, 0, 0.10)",
    "--border-default": "rgba(0, 0, 0, 0.18)",
  },
  purple: {
    "--background": "#1a0a2e",
    "--denim-200": "#d8b4fe",
    "--denim-300": "#c084fc",
    "--denim-400": "#a855f7",
    "--denim-500": "#9333ea",
    "--surface-1": "rgba(168, 85, 247, 0.06)",
    "--surface-2": "rgba(168, 85, 247, 0.10)",
    "--surface-3": "rgba(168, 85, 247, 0.15)",
    "--border-subtle": "rgba(168, 85, 247, 0.12)",
    "--border-default": "rgba(168, 85, 247, 0.25)",
  },
  ocean: {
    "--background": "#0a192f",
    "--denim-200": "#bae6fd",
    "--denim-300": "#7dd3fc",
    "--denim-400": "#38bdf8",
    "--denim-500": "#0ea5e9",
    "--surface-1": "rgba(56, 189, 248, 0.06)",
    "--surface-2": "rgba(56, 189, 248, 0.10)",
    "--surface-3": "rgba(56, 189, 248, 0.15)",
    "--border-subtle": "rgba(56, 189, 248, 0.10)",
    "--border-default": "rgba(56, 189, 248, 0.20)",
  },
};

/** Resolve theme name + CSS vars from a raw DB value. */
export function resolveTheme(raw: string | null | undefined) {
  const name = raw ?? "dark";
  return { name, vars: THEMES[name] ?? THEMES.dark };
}

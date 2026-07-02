// ─── Theme Constants ──────────────────────────────────────────────
// Centralized design tokens used across all StyleSheet definitions.

export const colors = {
  primary: {
    50: "#eff6ff",
    100: "#dbeafe",
    200: "#bfdbfe",
    300: "#93c5fd",
    400: "#60a5fa",
    500: "#3b82f6",
    600: "#2563eb",
    700: "#1d4ed8",
    800: "#1e40af",
    900: "#1e3a8a",
  },
  background: {
    light: "#ffffff",
    dark: "#0b1220",
  },
  surface: {
    light: "#f8fafc",
    dark: "#111a2e",
  },
  surfaceAlt: {
    light: "#ffffff",
    dark: "#172033",
  },
  text: {
    light: "#0f172a",
    dark: "#f8fafc",
  },
  textMuted: {
    light: "#64748b",
    dark: "#94a3b8",
  },
  border: {
    light: "#e2e8f0",
    dark: "#1f2a44",
  },
  error: "#ef4444",
  success: "#22c55e",
  warning: "#f59e0b",
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  "2xl": 48,
} as const;

export const radius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  pill: 999,
} as const;

export const typography = {
  display: { fontSize: 32, lineHeight: 38, fontWeight: "700" as const },
  h1: { fontSize: 26, lineHeight: 32, fontWeight: "700" as const },
  h2: { fontSize: 20, lineHeight: 26, fontWeight: "700" as const },
  h3: { fontSize: 17, lineHeight: 22, fontWeight: "600" as const },
  body: { fontSize: 15, lineHeight: 22, fontWeight: "400" as const },
  bodySm: { fontSize: 13, lineHeight: 18, fontWeight: "400" as const },
  caption: { fontSize: 12, lineHeight: 16, fontWeight: "500" as const },
  button: { fontSize: 15, lineHeight: 20, fontWeight: "600" as const },
} as const;

export const layout = {
  tabletBreakpoint: 768,
  contentMaxWidth: 640,
} as const;

export { useTheme } from "./useTheme";
export type { Theme } from "./useTheme";

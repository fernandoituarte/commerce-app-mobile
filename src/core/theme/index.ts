// ─── Theme Constants ──────────────────────────────────────────────
// Centralized color palette and spacing used across all StyleSheet definitions.

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
    dark: "#0f172a",
  },
  surface: {
    light: "#f8fafc",
    dark: "#1e293b",
  },
  text: {
    light: "#0f172a",
    dark: "#f8fafc",
  },
  border: {
    light: "#e2e8f0",
    dark: "#334155",
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

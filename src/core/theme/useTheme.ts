import { useColorScheme, useWindowDimensions } from "react-native";
import { colors, layout } from "./index";
import { useAppSelector } from "../store/hooks";

export interface Theme {
  scheme: "light" | "dark";
  isTablet: boolean;
  bg: string;
  surface: string;
  surfaceAlt: string;
  text: string;
  textMuted: string;
  border: string;
  primary: string;
  primarySoft: string;
  danger: string;
  dangerSoft: string;
  success: string;
  warning: string;
}

export function useTheme(): Theme {
  const mode = useAppSelector((s) => s.theme.mode);
  const systemScheme = useColorScheme();
  const scheme = mode === "system" ? (systemScheme === "dark" ? "dark" : "light") : mode;
  const { width } = useWindowDimensions();
  const isDark = scheme === "dark";

  return {
    scheme,
    isTablet: width >= layout.tabletBreakpoint,
    bg: colors.background[scheme],
    surface: colors.surface[scheme],
    surfaceAlt: colors.surfaceAlt[scheme],
    text: colors.text[scheme],
    textMuted: colors.textMuted[scheme],
    border: colors.border[scheme],
    primary: colors.primary[isDark ? 400 : 600],
    primarySoft: isDark ? "rgba(96,165,250,0.16)" : colors.primary[50],
    danger: colors.error,
    dangerSoft: isDark ? "rgba(239,68,68,0.16)" : "#fef2f2",
    success: colors.success,
    warning: colors.warning,
  };
}

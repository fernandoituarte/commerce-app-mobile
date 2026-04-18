import React from "react";
import {
  TouchableOpacity,
  Text,
  ActivityIndicator,
  StyleSheet,
  type TouchableOpacityProps,
  type ViewStyle,
  type TextStyle,
} from "react-native";
import { colors } from "../../../core/theme";

// ─── Props ────────────────────────────────────────────────────────

interface ButtonProps extends TouchableOpacityProps {
  title: string;
  variant?: "primary" | "secondary" | "outline" | "ghost";
  size?: "sm" | "md" | "lg";
  loading?: boolean;
  fullWidth?: boolean;
}

// ─── Style Maps ───────────────────────────────────────────────────

const containerVariants: Record<string, ViewStyle> = {
  primary: { backgroundColor: colors.primary[600] },
  secondary: { backgroundColor: "#475569" },
  outline: { borderWidth: 2, borderColor: colors.primary[600], backgroundColor: "transparent" },
  ghost: { backgroundColor: "transparent" },
};

const textVariants: Record<string, TextStyle> = {
  primary: { color: "#ffffff" },
  secondary: { color: "#ffffff" },
  outline: { color: colors.primary[600] },
  ghost: { color: colors.primary[600] },
};

const sizeVariants: Record<string, ViewStyle> = {
  sm: { paddingVertical: 8, paddingHorizontal: 16 },
  md: { paddingVertical: 12, paddingHorizontal: 24 },
  lg: { paddingVertical: 16, paddingHorizontal: 32 },
};

const textSizeVariants: Record<string, TextStyle> = {
  sm: { fontSize: 14 },
  md: { fontSize: 16 },
  lg: { fontSize: 18 },
};

// ─── Component ────────────────────────────────────────────────────

export function Button({
  title,
  variant = "primary",
  size = "md",
  loading = false,
  fullWidth = true,
  disabled,
  style,
  ...rest
}: ButtonProps) {
  const isDisabled = disabled || loading;

  return (
    <TouchableOpacity
      style={[
        styles.base,
        containerVariants[variant],
        sizeVariants[size],
        fullWidth && styles.fullWidth,
        isDisabled && styles.disabled,
        style as ViewStyle,
      ]}
      disabled={isDisabled}
      activeOpacity={0.8}
      {...rest}
    >
      {loading ? (
        <ActivityIndicator
          color={variant === "primary" || variant === "secondary" ? "#fff" : colors.primary[600]}
          size="small"
        />
      ) : (
        <Text
          style={[styles.text, textVariants[variant], textSizeVariants[size]]}
        >
          {title}
        </Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  base: {
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 12,
  },
  fullWidth: {
    width: "100%",
  },
  disabled: {
    opacity: 0.5,
  },
  text: {
    fontWeight: "600",
  },
});

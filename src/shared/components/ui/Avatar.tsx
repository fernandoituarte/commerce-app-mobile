import React from "react";
import { View, Text, Image, StyleSheet } from "react-native";
import { typography, useTheme } from "../../../core/theme";

type Size = "sm" | "md" | "lg" | "xl";

interface AvatarProps {
  name?: string;
  uri?: string;
  size?: Size;
}

const sizes: Record<Size, number> = { sm: 32, md: 44, lg: 64, xl: 96 };
const fontSizes: Record<Size, number> = { sm: 12, md: 16, lg: 22, xl: 32 };

function initials(name?: string) {
  if (!name) return "?";
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? "")
    .join("");
}

export function Avatar({ name, uri, size = "md" }: AvatarProps) {
  const t = useTheme();
  const d = sizes[size];

  if (uri) {
    return (
      <Image
        source={{ uri }}
        style={[
          styles.base,
          { width: d, height: d, borderRadius: d / 2, backgroundColor: t.surface },
        ]}
      />
    );
  }

  return (
    <View
      style={[
        styles.base,
        styles.fallback,
        {
          width: d,
          height: d,
          borderRadius: d / 2,
          backgroundColor: t.primarySoft,
        },
      ]}
    >
      <Text
        style={[
          typography.h3,
          { color: t.primary, fontSize: fontSizes[size] },
        ]}
      >
        {initials(name)}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  base: { overflow: "hidden" },
  fallback: { alignItems: "center", justifyContent: "center" },
});

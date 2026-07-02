import React from "react";
import { Pressable, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { radius, useTheme } from "../../../core/theme";

interface FloatingActionProps {
  onPress: () => void;
  icon?: React.ComponentProps<typeof Ionicons>["name"];
  disabled?: boolean;
}

export function FloatingAction({
  onPress,
  icon = "add",
  disabled = false,
}: FloatingActionProps) {
  const t = useTheme();
  return (
    <Pressable
      onPress={disabled ? undefined : onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityState={{ disabled }}
      style={({ pressed }) => [
        styles.fab,
        {
          backgroundColor: disabled ? t.textMuted : t.primary,
          shadowColor: disabled ? t.textMuted : t.primary,
        },
        !disabled && pressed && { transform: [{ scale: 0.94 }] },
        disabled && { opacity: 0.4 },
      ]}
    >
      <Ionicons name={icon} size={28} color="#fff" />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  fab: {
    position: "absolute",
    bottom: 24,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: radius.pill,
    alignItems: "center",
    justifyContent: "center",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
});

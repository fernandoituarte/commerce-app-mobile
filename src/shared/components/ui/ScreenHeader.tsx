import React from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { spacing, typography, useTheme } from "../../../core/theme";

interface ScreenHeaderProps {
  title: string;
  subtitle?: string;
  showBack?: boolean;
  onBack?: () => void;
  right?: React.ReactNode;
}

export function ScreenHeader({
  title,
  subtitle,
  showBack = true,
  onBack,
  right,
}: ScreenHeaderProps) {
  const t = useTheme();
  const router = useRouter();

  const handleBack = () => {
    if (onBack) return onBack();
    if (router.canGoBack()) router.back();
    else router.replace("/(app)");
  };

  return (
    <View style={styles.wrap}>
      <View style={styles.row}>
        {showBack ? (
          <Pressable
            onPress={handleBack}
            hitSlop={12}
            accessibilityRole="button"
            accessibilityLabel="Back"
            style={({ pressed }) => [
              styles.iconBtn,
              { backgroundColor: t.surface },
              pressed && styles.pressed,
            ]}
          >
            <Ionicons name="chevron-back" size={22} color={t.text} />
          </Pressable>
        ) : (
          <View style={styles.iconBtn} />
        )}

        <View style={styles.titleWrap}>
          <Text
            style={[typography.h2, { color: t.text, textAlign: "center" }]}
            numberOfLines={1}
          >
            {title}
          </Text>
        </View>

        <View style={styles.iconBtn}>{right}</View>
      </View>

      {subtitle ? (
        <Text
          style={[
            typography.bodySm,
            { color: t.textMuted, textAlign: "center", marginTop: spacing.xs },
          ]}
        >
          {subtitle}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    paddingTop: spacing.md,
    paddingBottom: spacing.md,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  titleWrap: {
    flex: 1,
    paddingHorizontal: spacing.sm,
  },
  iconBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  pressed: { opacity: 0.6 },
});

import React from "react";
import { View, Text, Pressable, StyleSheet, Linking } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import { typography, spacing, useTheme } from "@/core/theme";
import { env } from "@/core/config/env";

export function ReadOnlyBanner() {
  const { t } = useTranslation();
  const theme = useTheme();
  const { bottom } = useSafeAreaInsets();

  const handleManage = () => {
    if (env.SUBSCRIPTION_URL) {
      Linking.openURL(env.SUBSCRIPTION_URL);
    }
  };

  return (
    <View
      style={[
        styles.banner,
        {
          backgroundColor: theme.surfaceAlt,
          borderTopColor: theme.warning,
          paddingBottom: bottom > 0 ? bottom : spacing.sm,
        },
      ]}
    >
      <Ionicons name="warning-outline" size={16} color={theme.warning} />
      <Text
        style={[typography.bodySm, styles.label, { color: theme.text }]}
        numberOfLines={2}
      >
        {t("subscription.readonly.banner")}
      </Text>
      {env.SUBSCRIPTION_URL ? (
        <Pressable onPress={handleManage} hitSlop={8}>
          <Text
            style={[typography.bodySm, { color: theme.primary, fontWeight: "600" }]}
            numberOfLines={1}
          >
            {t("subscription.readonly.manage")}
          </Text>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  banner: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    paddingTop: spacing.sm,
    paddingHorizontal: spacing.md,
    borderTopWidth: 2,
  },
  label: {
    flex: 1,
  },
});

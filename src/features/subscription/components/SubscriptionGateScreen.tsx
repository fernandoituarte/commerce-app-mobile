import React from "react";
import { View, Text, StyleSheet, Linking } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import { Button } from "@/shared/components/ui";
import { typography, spacing, radius, useTheme } from "@/core/theme";
import { env } from "@/core/config/env";
import { useLogout } from "@/features/sessions/hooks";

interface Props {
  refetch: () => void;
  isFetching: boolean;
}

export function SubscriptionGateScreen({ refetch, isFetching }: Props) {
  const { t } = useTranslation();
  const theme = useTheme();
  const logoutMutation = useLogout();

  const handleManage = () => {
    if (env.SUBSCRIPTION_URL) {
      Linking.openURL(env.SUBSCRIPTION_URL);
    }
  };

  return (
    <SafeAreaView style={[styles.root, { backgroundColor: theme.bg }]}>
      <View style={styles.content}>
        <View style={[styles.iconWrap, { backgroundColor: theme.surfaceAlt, borderColor: theme.border }]}>
          <Ionicons name="lock-closed-outline" size={36} color={theme.textMuted} />
        </View>

        <Text style={[typography.h2, styles.title, { color: theme.text }]}>
          {t("subscription.gate.title")}
        </Text>

        <Text style={[typography.body, styles.description, { color: theme.textMuted }]}>
          {t("subscription.gate.description")}
        </Text>

        {env.SUBSCRIPTION_URL ? (
          <Button
            title={t("subscription.gate.manageButton")}
            onPress={handleManage}
            style={styles.button}
          />
        ) : null}

        <Button
          title={t("subscription.gate.retryButton")}
          variant="outline"
          loading={isFetching}
          onPress={refetch}
          style={styles.button}
        />

        <Button
          title={t("subscription.gate.logout")}
          variant="ghost"
          loading={logoutMutation.isPending}
          onPress={() => logoutMutation.mutate()}
          style={styles.logoutButton}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  content: {
    alignItems: "center",
    paddingHorizontal: spacing.xl,
    maxWidth: 400,
    width: "100%",
  },
  iconWrap: {
    width: 80,
    height: 80,
    borderRadius: radius.xl,
    borderWidth: StyleSheet.hairlineWidth,
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    textAlign: "center",
    marginTop: spacing.lg,
  },
  description: {
    textAlign: "center",
    marginTop: spacing.sm,
    marginBottom: spacing.xl,
  },
  button: {
    marginTop: spacing.sm,
    width: "100%",
  },
  logoutButton: {
    marginTop: spacing.md,
    width: "100%",
  },
});

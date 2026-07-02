import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import { Button } from "@/shared/components/ui";
import { typography, spacing, radius, useTheme } from "@/core/theme";
import { useLogout } from "@/features/sessions/hooks";

interface Props {
  refetch: () => void;
  isFetching: boolean;
}

export function SubscriptionProcessingScreen({ refetch, isFetching }: Props) {
  const { t } = useTranslation();
  const theme = useTheme();
  const logoutMutation = useLogout();

  return (
    <SafeAreaView style={[styles.root, { backgroundColor: theme.bg }]}>
      <View style={styles.content}>
        <View
          style={[
            styles.iconWrap,
            { backgroundColor: theme.primarySoft, borderColor: theme.border },
          ]}
        >
          <Ionicons name="time-outline" size={36} color={theme.primary} />
        </View>

        <Text style={[typography.h2, styles.title, { color: theme.text }]}>
          {t("subscription.processing.title")}
        </Text>

        <Text
          style={[typography.body, styles.description, { color: theme.textMuted }]}
        >
          {t("subscription.processing.description")}
        </Text>

        <Button
          title={t("subscription.processing.retryButton")}
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

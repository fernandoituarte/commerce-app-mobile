import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import {
  Avatar,
  Badge,
  Button,
  DangerZone,
  ScreenContainer,
  ScreenHeader,
  SettingsGroup,
  SettingsRow,
} from "@/shared/components/ui";
import { radius, spacing, typography, useTheme } from "@/core/theme";
import { useUserProfile } from "@/features/user/hooks/useUser";
import { useLogout } from "@/features/sessions/hooks";

export default function ProfileScreen() {
  const { t, i18n } = useTranslation();
  const router = useRouter();
  const theme = useTheme();
  const { data } = useUserProfile();
  const { mutate: logout } = useLogout();

  const memberSince = data?.user?.createdAt
    ? new Intl.DateTimeFormat(i18n.language, {
        month: "long",
        year: "numeric",
      }).format(new Date(data.user.createdAt))
    : "";

  return (
    <ScreenContainer scroll>
      <ScreenHeader title={t("account.profile.title")} />

      {/* Profile card */}
      <View
        style={[
          styles.card,
          { backgroundColor: theme.surfaceAlt, borderColor: theme.border },
        ]}
      >
        <Avatar name={data?.user?.name || ""} size="xl" />
        <Text
          style={[typography.h2, { color: theme.text, marginTop: spacing.md }]}
        >
          {data?.user?.name || ""}
        </Text>
        <Text
          style={[typography.body, { color: theme.textMuted, marginTop: 2 }]}
        >
          {data?.user?.email || ""}
        </Text>
        <View style={{ marginTop: spacing.sm }}>
          <Badge
            label={`${t("account.profile.memberSince")} ${memberSince}`}
            tone="primary"
          />
        </View>
        <Button
          title={t("account.profile.editProfile")}
          variant="outline"
          size="sm"
          fullWidth={false}
          onPress={() => router.push("/(account)/profile/update")}
          style={{ marginTop: spacing.md }}
        />
      </View>

      {/* Account */}
      <SettingsGroup title={t("account.sections.account")}>
        <SettingsRow
          icon="mail-outline"
          label={t("account.email.title")}
          onPress={() => router.push("/(account)/settings/account/email")}
        />
        <SettingsRow
          icon="lock-closed-outline"
          label={t("account.password.title")}
          subtitle={t("account.password.subtitle")}
          onPress={() => router.push("/(account)/settings/account/password")}
        />
        <SettingsRow
          icon="color-palette-outline"
          label={t("account.theme.title")}
          onPress={() => router.push("/(account)/theme")}
        />
      </SettingsGroup>

      {/* Subscription */}
      <SettingsGroup title={t("account.sections.subscription")}>
        <SettingsRow
          icon="star-outline"
          label={t("account.subscription.current")}
          onPress={() => router.push("/(account)/subscription/current")}
        />
        <SettingsRow
          icon="receipt-outline"
          label={t("account.subscription.history")}
          onPress={() => router.push("/(account)/subscription/history")}
        />
        <SettingsRow
          icon="add-circle-outline"
          label={t("account.subscription.upgrade")}
          onPress={() => router.push("/(account)/subscription/create")}
        />
      </SettingsGroup>

      {/* Sessions */}
      <SettingsGroup title={t("account.sections.sessions")}>
        <SettingsRow
          icon="shield-checkmark-outline"
          label={t("account.logoutAll.title")}
          onPress={() =>
            router.push("/(account)/settings/account/logout-all-devices")
          }
        />
        <SettingsRow
          icon="log-out-outline"
          label={t("account.logout.title")}
          onPress={() => logout()}
        />
      </SettingsGroup>

      {/* Danger zone */}
      <DangerZone
        title={t("account.dangerZone.title")}
        description={t("account.dangerZone.description")}
      >
        <SettingsGroup>
          <SettingsRow
            icon="pause-circle-outline"
            label={t("account.deactivate.title")}
            destructive
            onPress={() =>
              router.push("/(account)/settings/account/deactivate")
            }
          />
          <SettingsRow
            icon="trash-outline"
            label={t("account.delete.title")}
            destructive
            onPress={() => router.push("/(account)/settings/account/delete")}
          />
        </SettingsGroup>
      </DangerZone>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  card: {
    alignItems: "center",
    padding: spacing.lg,
    borderRadius: radius.xl,
    borderWidth: StyleSheet.hairlineWidth,
    marginBottom: spacing.lg,
  },
});

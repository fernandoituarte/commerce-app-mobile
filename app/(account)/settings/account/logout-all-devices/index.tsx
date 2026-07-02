import React, { useState } from "react";
import { View, Text, Pressable, ActivityIndicator, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import {
  Badge,
  Button,
  ConfirmDialog,
  EmptyState,
  ListItem,
  ScreenContainer,
  ScreenHeader,
  Skeleton,
} from "@/shared/components/ui";
import { radius, spacing, typography, useTheme } from "@/core/theme";
import {
  useGetAllSessions,
  useLogoutAll,
  useRevokeSession,
} from "@/features/sessions/hooks";

export default function LogoutAllDevicesScreen() {
  const { t, i18n } = useTranslation();
  const theme = useTheme();

  const [logoutAllOpen, setLogoutAllOpen] = useState(false);
  const [revokeTarget, setRevokeTarget] = useState<string | null>(null);

  const { data, isLoading, isError, refetch, isRefetching } = useGetAllSessions();

  const fmtDateTime = (value: Date | string | null | undefined): string | null => {
    if (!value) return null;
    const d = new Date(value as string);
    if (isNaN(d.getTime())) return null;
    return new Intl.DateTimeFormat(i18n.language, {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(d);
  };
  const logoutAll = useLogoutAll();
  const revokeSession = useRevokeSession();

  return (
    <ScreenContainer scroll>
      <ScreenHeader
        title={t("account.logoutAll.title")}
        right={
          <Pressable
            onPress={() => refetch()}
            disabled={isRefetching}
            hitSlop={8}
            accessibilityRole="button"
            accessibilityLabel={t("account.logoutAll.refresh")}
            style={({ pressed }) => pressed && !isRefetching && { opacity: 0.6 }}
          >
            {isRefetching ? (
              <ActivityIndicator size="small" color={theme.textMuted} />
            ) : (
              <Ionicons name="refresh-outline" size={22} color={theme.text} />
            )}
          </Pressable>
        }
      />

      <View
        style={[
          styles.info,
          { backgroundColor: theme.surfaceAlt, borderColor: theme.border },
        ]}
      >
        <Text style={[typography.body, { color: theme.text }]}>
          {t("account.logoutAll.description")}
        </Text>
      </View>

      <Text
        style={[
          typography.caption,
          {
            color: theme.textMuted,
            marginTop: spacing.lg,
            marginBottom: spacing.sm,
            marginLeft: spacing.sm,
            letterSpacing: 0.5,
          },
        ]}
      >
        {t("account.logoutAll.devicesLabel").toUpperCase()}
      </Text>

      <View style={styles.list}>
        {isLoading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <View
              key={i}
              style={[
                styles.skel,
                {
                  backgroundColor: theme.surfaceAlt,
                  borderColor: theme.border,
                },
              ]}
            >
              <Skeleton width={36} height={36} circle />
              <View style={{ flex: 1, gap: 6 }}>
                <Skeleton width="60%" height={14} />
                <Skeleton width="40%" height={12} />
              </View>
            </View>
          ))
        ) : isError ? (
          <EmptyState
            icon="alert-circle-outline"
            title={t("account.logoutAll.errorTitle")}
            description={t("account.logoutAll.errorDescription")}
            actionLabel={t("account.logoutAll.retry")}
            onAction={refetch}
          />
        ) : (
          (data ?? []).map((session) => (
            <ListItem
              key={session.jti}
              icon="phone-portrait-outline"
              title={session.device}
              subtitle={[fmtDateTime(session.createdAt)].filter(Boolean).join(" · ")}
              right={
                session.current ? (
                  <Badge label={t("account.logoutAll.current")} tone="success" />
                ) : (
                  <Pressable
                    onPress={() => setRevokeTarget(session.jti)}
                    hitSlop={8}
                  >
                    <Ionicons
                      name="close-circle-outline"
                      size={20}
                      color={theme.danger}
                    />
                  </Pressable>
                )
              }
            />
          ))
        )}
      </View>

      <View style={{ marginTop: spacing.lg }}>
        <Button
          title={t("account.logoutAll.action")}
          variant="primary"
          loading={logoutAll.isPending}
          style={{ backgroundColor: theme.danger }}
          onPress={() => setLogoutAllOpen(true)}
        />
      </View>

      {/* Logout all devices */}
      <ConfirmDialog
        open={logoutAllOpen}
        onOpenChange={setLogoutAllOpen}
        title={t("account.logoutAll.confirmTitle")}
        description={t("account.logoutAll.confirmDescription")}
        confirmLabel={t("account.logoutAll.action")}
        cancelLabel={t("account.actions.cancel")}
        destructive
        onConfirm={() => {
          setLogoutAllOpen(false);
          logoutAll.mutate();
        }}
      />

      {/* Revoke individual session */}
      <ConfirmDialog
        open={revokeTarget !== null}
        onOpenChange={(open) => {
          if (!open) setRevokeTarget(null);
        }}
        title={t("account.logoutAll.revokeConfirmTitle")}
        description={t("account.logoutAll.revokeConfirmDescription")}
        confirmLabel={t("account.logoutAll.revokeLabel")}
        cancelLabel={t("account.actions.cancel")}
        destructive
        onConfirm={() => {
          if (revokeTarget) {
            revokeSession.mutate(revokeTarget);
            setRevokeTarget(null);
          }
        }}
      />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  info: {
    padding: spacing.md,
    borderRadius: radius.lg,
    borderWidth: StyleSheet.hairlineWidth,
  },
  list: { gap: spacing.sm },
  skel: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    padding: spacing.md,
    borderRadius: radius.lg,
    borderWidth: StyleSheet.hairlineWidth,
  },
});

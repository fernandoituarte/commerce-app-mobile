import React from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  Pressable,
} from "react-native";
import { useTranslation } from "react-i18next";
import { useUserProfile } from "../hooks";
import { colors, spacing } from "../../../core/theme";
import { useSubscription } from "@/features/subscription/hooks";
import { Ionicons, Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { AlertDialogLanguage } from "../components/AlertDialogLanguage";
import { useLogout } from "@/features/sessions/hooks";

export function ProfileScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const { data, isLoading, isError, error } = useUserProfile();
  const { data: subscriptionData } = useSubscription();
  const logoutMutation = useLogout();

  if (isLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={colors.primary[600]} />
      </View>
    );
  }

  if (isError) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>
          {error?.message ?? t("user.profile.errorLoading")}
        </Text>
      </View>
    );
  }

  const user = data?.user;
  const dateFormat: Intl.DateTimeFormatOptions = {
    year: "numeric",
    month: "numeric",
    day: "numeric",
  };

  const memberDate = user?.createdAt
    ? new Date(user.createdAt).toLocaleDateString(undefined, dateFormat)
    : "";

  const subscriptionDateExpires = subscriptionData?.currentPeriodEnd
    ? new Date(subscriptionData.currentPeriodEnd).toLocaleDateString(
        undefined,
        dateFormat,
      )
    : "";

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* ── Header Card ──────────────────────────────── */}
      <View>
        <Pressable
          onPress={() => router.back()}
          style={{ padding: spacing.sm, marginBottom: spacing.sm }}
        >
          <Ionicons name="arrow-back-sharp" size={24} color="black" />
        </Pressable>
      </View>
      <View style={styles.headerCard}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {user?.name?.charAt(0).toUpperCase() ?? "?"}
          </Text>
        </View>
        <Text style={styles.userName}>{user?.name ?? ""}</Text>
        <Text style={styles.userEmail}>{user?.email ?? ""}</Text>

        <View
          style={[
            styles.badge,
            user?.emailVerified ? styles.badgeSuccess : styles.badgeError,
          ]}
        >
          <Text
            style={[
              styles.badgeText,
              user?.emailVerified
                ? styles.badgeTextSuccess
                : styles.badgeTextError,
            ]}
          >
            {user?.emailVerified
              ? t("user.profile.verified")
              : t("user.profile.unverified")}
          </Text>
        </View>
      </View>
      {/* ── Info Section ─────────────────────────────── */}
      <View style={styles.section}>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>{t("user.profile.title")}</Text>
          <Pressable
            onPress={() => {
              router.push("/profile/update");
            }}
          >
            <Feather name="edit" size={18} color={colors.primary[600]} />
          </Pressable>
        </View>
        <InfoRow label={t("user.profile.name")} value={user?.name ?? "—"} />
        <InfoRow label={t("user.profile.phone")} value={"0667596098"} />
        <InfoRow label={t("user.profile.memberSince")} value={memberDate} />
      </View>
      {/* ── Subscription Section  ─────────────────────────────── */}
      <View style={styles.section}>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>{t("subscription.title")}</Text>
          <Pressable
            onPress={() => {
              router.push("/subscription");
            }}
          >
            <Feather name="settings" size={18} color={colors.primary[600]} />
          </Pressable>
        </View>
        <InfoRow
          label={t("subscription.plan")}
          value={subscriptionData?.plan ?? "—"}
        />
        <InfoRow
          label={t("subscription.status")}
          value={subscriptionData?.status ?? "—"}
        />
        <InfoRow
          label={t("subscription.expiresOn")}
          value={subscriptionDateExpires ?? "—"}
        />
      </View>
      {/* ── App Settings Section ─────────────────────────────── */}
      <View style={styles.section}>
        <InfoRow label={t("app.settings.title")} />
        <InfoRow
          label={t("app.settings.language")}
          icon={<AlertDialogLanguage />}
        />
        <InfoRow
          label={t("app.settings.theme")}
          icon={
            <Ionicons
              name="arrow-forward-sharp"
              size={18}
              color={colors.primary[600]}
            />
          }
        />
      </View>

      {/* ── Account Section ─────────────────────────────── */}
      <View style={styles.section}>
        <InfoRow label={t("user.account.title")} />
        <InfoRow
          label={t("common.email")}
          icon={
            <Ionicons
              name="arrow-forward-sharp"
              size={18}
              color={colors.primary[600]}
            />
          }
        />
        <InfoRow
          label={t("user.account.passwordModification")}
          icon={
            <Ionicons
              name="arrow-forward-sharp"
              size={18}
              color={colors.primary[600]}
            />
          }
        />
        <InfoRow
          label={t("user.profile.logoutAll")}
          icon={
            <Ionicons
              name="arrow-forward-sharp"
              size={18}
              color={colors.primary[600]}
            />
          }
        />
        <InfoRow
          label={t("user.account.deactivate")}
          icon={
            <Ionicons
              name="arrow-forward-sharp"
              size={18}
              color={colors.primary[600]}
            />
          }
        />
        <InfoRow
          label={t("user.account.delete")}
          icon={
            <Ionicons
              name="arrow-forward-sharp"
              size={18}
              color={colors.primary[600]}
            />
          }
        />
      </View>

      {/* ── Logout ───────────────────────────────────── */}
      <Pressable
        style={styles.logoutButton}
        onPress={() => logoutMutation.mutate()}
      >
        <Text style={styles.logoutText}>{t("user.profile.logout")}</Text>
      </Pressable>
    </ScrollView>
  );
}

function InfoRow({
  label,
  value,
  icon,
}: {
  label: string;
  value?: string;
  icon?: React.ReactNode;
}) {
  return (
    <View style={styles.infoRow}>
      <Text style={styles.infoLabel}>{label}</Text>

      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          flex: 1,
          justifyContent: "flex-end",
        }}
      >
        {value && (
          <Text style={styles.infoValue} numberOfLines={1} ellipsizeMode="tail">
            {value}
          </Text>
        )}

        {icon && (
          <View style={{ marginLeft: spacing.sm, flexShrink: 0 }}>{icon}</View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.surface.light,
  },
  content: {
    paddingHorizontal: spacing.lg,
    paddingTop: 60,
    paddingBottom: spacing["2xl"],
  },
  centered: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.surface.light,
  },
  errorText: {
    fontSize: 14,
    color: colors.error,
    textAlign: "center",
    paddingHorizontal: spacing.lg,
  },

  // ── Header Card ──
  headerCard: {
    alignItems: "center",
    borderRadius: 16,
    paddingVertical: spacing.xl,
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.lg,
  },
  avatar: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: colors.primary[100],
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.md,
  },
  avatarText: {
    fontSize: 36,
    fontWeight: "700",
    color: colors.primary[600],
  },
  userName: {
    fontSize: 22,
    fontWeight: "700",
    color: colors.text.light,
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
    color: "#64748b",
    marginBottom: spacing.md,
  },
  badge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeSuccess: {
    backgroundColor: "#dcfce7",
  },
  badgeError: {
    backgroundColor: "#fee2e2",
  },
  badgeText: {
    fontSize: 12,
    fontWeight: "600",
  },
  badgeTextSuccess: {
    color: "#16a34a",
  },
  badgeTextError: {
    color: "#dc2626",
  },

  // ── Info Section ──
  section: {
    backgroundColor: colors.background.light,
    borderRadius: 16,
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.lg,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 16,
  },
  infoRowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
  },
  infoLabel: {
    fontSize: 14,
    color: "#64748b",
    marginRight: spacing.sm,
  },
  infoValue: {
    fontSize: 14,
    fontWeight: "500",
    color: colors.text.light,
    flexShrink: 1,
    textAlign: "right",
    maxWidth: "100%",
  },

  // ── Logout ──
  logoutButton: {
    alignItems: "center",
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.error,
  },
  logoutText: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.error,
  },
});

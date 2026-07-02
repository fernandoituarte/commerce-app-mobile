import React, { useState } from "react";
import {
  View,
  Text,
  Pressable,
  ScrollView,
  StyleSheet,
  Modal,
} from "react-native";
import { Ionicons, FontAwesome } from "@expo/vector-icons";
import { useQueryClient } from "@tanstack/react-query";
import { useRouter, useSegments } from "expo-router";
import { useTranslation } from "react-i18next";

import { Avatar } from "./ui/Avatar";
import { radius, spacing, typography, useTheme } from "../../core/theme";
import {
  useGetOrganization,
  useOrganizationsByUserId,
} from "@/features/organization/hooks/useOrganization";
import { useAppDispatch, useAppSelector } from "@/core/store/hooks";
import { setMembership } from "@/features/organization/store/organizationSlice";
import type { OrganizationMembership } from "@/features/organization/types";
import { storage } from "../utils/storage";

// ─── Nav Structure ────────────────────────────────────────────────

type IconName = React.ComponentProps<typeof Ionicons>["name"];

interface NavItem {
  key: string;
  icon: IconName;
  route: string;
  badge?: number;
}

interface NavGroup {
  key: string;
  items: NavItem[];
}

const NAV: NavGroup[] = [
  {
    key: "organization",
    items: [
      {
        key: "profile",
        icon: "business-outline",
        route: "/(organization)/profile",
      },
    ],
  },
  {
    key: "products",
    items: [
      {
        key: "productsList",
        icon: "grid-outline",
        route: "/(organization)/products",
      },
      {
        key: "categories",
        icon: "albums-outline",
        route: "/(organization)/products/categories",
      },
      {
        key: "extras",
        icon: "add-circle-outline",
        route: "/(organization)/products/extras",
      },
      {
        key: "ingredients",
        icon: "leaf-outline",
        route: "/(organization)/products/ingredients",
      },
      {
        key: "tags",
        icon: "pricetag-outline",
        route: "/(organization)/products/tags",
      },
      {
        key: "stock",
        icon: "cube-outline",
        route: "/(organization)/products/stock",
      },
    ],
  },
  {
    key: "sales",
    items: [
      {
        key: "orders",
        icon: "receipt-outline",
        route: "/(organization)/sales/orders",
        badge: 3,
      },
      {
        key: "payments",
        icon: "cash-outline",
        route: "/(organization)/sales/payments",
      },
      {
        key: "analytics",
        icon: "bar-chart-outline",
        route: "/(organization)/sales/analytics",
      },
      {
        key: "clients",
        icon: "people-outline",
        route: "/(organization)/sales/clients",
      },
    ],
  },
  {
    key: "payments",
    items: [
      {
        key: "paymentMethods",
        icon: "card-outline",
        route: "/(organization)/payment-methods",
      },
    ],
  },
];

// ─── Component ────────────────────────────────────────────────────

interface OrgNavContentProps {
  onNavigate?: () => void;
}

export function OrgNavContent({ onNavigate }: OrgNavContentProps) {
  const t = useTheme();
  const { t: tr } = useTranslation();
  const router = useRouter();
  const segments = useSegments();
  const dispatch = useAppDispatch();
  const { currentOrganizationId } = useAppSelector((s) => s.organization);
  const { data: organization } = useGetOrganization(currentOrganizationId || "");
  const { data: organizations } = useOrganizationsByUserId();
  const { user } = useAppSelector((s) => s.auth);

  const queryClient = useQueryClient();
  const [selectorVisible, setSelectorVisible] = useState(false);

  function isActive(route: string): boolean {
    const parts = route.replace(/^\//, "").split("/").filter(Boolean);
    return (
      parts.length === segments.length &&
      parts.every((p, i) => p === segments[i])
    );
  }

  function handleSelectOrg(org: OrganizationMembership) {
    queryClient.removeQueries({ queryKey: ["orders"] });
    queryClient.removeQueries({ queryKey: ["payments"] });
    dispatch(setMembership(org));
    if (user && user.id) {
      storage.setOrganizationId(user.id, org.organization.id);
    }
    setSelectorVisible(false);
  }

  return (
    <View style={[styles.root, { backgroundColor: t.surfaceAlt }]}>
      {/* Org selector modal */}
      <Modal
        visible={selectorVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setSelectorVisible(false)}
      >
        <Pressable
          style={styles.modalBackdrop}
          onPress={() => setSelectorVisible(false)}
        >
          <Pressable
            style={[
              styles.modalSheet,
              { backgroundColor: t.surface, borderColor: t.border },
            ]}
          >
            <Text
              style={[
                typography.h3,
                { color: t.text, marginBottom: spacing.sm },
              ]}
            >
              {tr("org.actions.selectOrganization")}
            </Text>
            {organizations?.map((org) => (
              <Pressable
                key={org.organization.id}
                onPress={() => handleSelectOrg(org)}
                style={({ pressed }) => [
                  styles.orgRow,
                  { borderColor: t.border },
                  pressed && { backgroundColor: t.primarySoft },
                ]}
              >
                <Avatar name={org.organization.name} size="sm" />
                <View style={{ flex: 1 }}>
                  <Text
                    style={[
                      typography.body,
                      { color: t.text, fontWeight: "600" },
                    ]}
                    numberOfLines={1}
                  >
                    {org.organization.name}
                  </Text>
                  <Text
                    style={[typography.caption, { color: t.textMuted }]}
                    numberOfLines={1}
                  >
                    {org.organization.contactEmail}
                  </Text>
                </View>
              </Pressable>
            ))}
            <Pressable
              key={"create_new"}
              onPress={() => router.push("/(organization)/create")}
              style={({ pressed }) => [
                styles.orgRow,
                { borderColor: t.border },
                pressed && { backgroundColor: t.primarySoft },
              ]}
            >
              <FontAwesome name="plus" size={16} color={t.primary} />
              <Text
                style={[
                  typography.body,
                  { color: t.primary, fontWeight: "600" },
                ]}
              >
                {tr("org.actions.createOrganization")}
              </Text>
            </Pressable>
          </Pressable>
        </Pressable>
      </Modal>

      {/* Org header */}
      <View style={[styles.orgHeader, { borderBottomColor: t.border }]}>
        <Avatar name={organization?.name} size="md" />
        <View style={{ flex: 1 }}>
          <Text style={[typography.h3, { color: t.text }]} numberOfLines={1}>
            {organization?.name}
          </Text>
          <Text
            style={[typography.caption, { color: t.textMuted }]}
            numberOfLines={1}
          >
            {organization?.contactEmail}
          </Text>
        </View>
        <Pressable
          onPress={() => setSelectorVisible(true)}
          accessibilityRole="button"
          style={({ pressed }) => [
            {
              padding: spacing.sm,
              borderRadius: radius.md,
              backgroundColor: pressed ? t.primarySoft : "transparent",
            },
          ]}
        >
          <FontAwesome name="exchange" size={16} color={t.textMuted} />
        </Pressable>
      </View>

      {/* Nav groups */}
      <ScrollView showsVerticalScrollIndicator={false} style={styles.scroll}>
        {NAV.map((group) => (
          <View key={group.key} style={styles.group}>
            <Text
              style={[
                typography.caption,
                {
                  color: t.textMuted,
                  letterSpacing: 0.6,
                  paddingHorizontal: spacing.sm,
                },
              ]}
            >
              {tr(`org.nav.${group.key}`).toUpperCase()}
            </Text>
            {group.items.map((item) => {
              const active = isActive(item.route);
              return (
                <Pressable
                  key={item.key}
                  onPress={() => {
                    router.push(item.route as any);
                    onNavigate?.();
                  }}
                  accessibilityRole="button"
                  accessibilityState={{ selected: active }}
                  style={({ pressed }) => [
                    styles.navItem,
                    active && { backgroundColor: t.primarySoft },
                    pressed && { opacity: 0.7 },
                  ]}
                >
                  <Ionicons
                    name={item.icon}
                    size={18}
                    color={active ? t.primary : t.textMuted}
                  />
                  <Text
                    style={[
                      typography.body,
                      {
                        color: active ? t.primary : t.text,
                        fontWeight: active ? "600" : "400",
                        flex: 1,
                      },
                    ]}
                  >
                    {tr(`org.nav.${item.key}`)}
                  </Text>
                  {item.badge ? (
                    <View
                      style={[styles.badge, { backgroundColor: t.primary }]}
                    >
                      <Text style={styles.badgeText}>{item.badge}</Text>
                    </View>
                  ) : null}
                </Pressable>
              );
            })}
          </View>
        ))}
      </ScrollView>

      {/* Back to POS */}
      <View style={[styles.backToPosWrap, { borderTopColor: t.border }]}>
        <Pressable
          onPress={() => {
            router.replace("/(app)");
            onNavigate?.();
          }}
          accessibilityRole="button"
          style={({ pressed }) => [
            styles.navItem,
            pressed && { opacity: 0.7 },
          ]}
        >
          <Ionicons name="storefront-outline" size={18} color={t.textMuted} />
          <Text style={[typography.body, { color: t.text, flex: 1 }]}>
            {tr("org.nav.backToPOS")}
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  orgHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  scroll: { flex: 1 },
  group: { paddingTop: spacing.md, paddingHorizontal: spacing.sm, gap: 2 },
  navItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.sm + 2,
    borderRadius: radius.md,
  },
  backToPosWrap: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.sm,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  badge: {
    borderRadius: radius.pill,
    paddingHorizontal: 7,
    paddingVertical: 2,
    minWidth: 20,
    alignItems: "center",
  },
  badgeText: { color: "#fff", fontSize: 11, fontWeight: "700" },
  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
    alignItems: "center",
    padding: spacing.lg,
  },
  modalSheet: {
    width: "100%",
    borderRadius: radius.lg,
    borderWidth: StyleSheet.hairlineWidth,
    padding: spacing.md,
    gap: spacing.xs,
  },
  orgRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    padding: spacing.sm,
    borderRadius: radius.md,
    borderWidth: StyleSheet.hairlineWidth,
  },
});

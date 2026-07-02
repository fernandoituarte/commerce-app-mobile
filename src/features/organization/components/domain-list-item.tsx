import React from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import { spacing, typography, useTheme } from "@/core/theme";
import type { OrganizationDomain } from "@/features/organization-domains/types";

interface DomainListItemProps {
  domain: OrganizationDomain;
  isOnly: boolean;
  onEdit: (domain: OrganizationDomain) => void;
  onDelete: (domain: OrganizationDomain) => void;
}

export function DomainListItem({ domain, isOnly, onEdit, onDelete }: DomainListItemProps) {
  const theme = useTheme();
  const { t } = useTranslation();

  return (
    <View style={[styles.row, { borderTopColor: theme.border }]}>
      <Text style={[typography.body, { color: theme.text, flex: 1 }]} numberOfLines={1}>
        {domain.domain}
      </Text>
      <Pressable
        onPress={() => onEdit(domain)}
        hitSlop={8}
        style={({ pressed }) => [styles.iconBtn, pressed && { opacity: 0.6 }]}
        accessibilityRole="button"
        accessibilityLabel={t("org.actions.edit")}
      >
        <Ionicons name="pencil-outline" size={16} color={theme.primary} />
      </Pressable>
      <Pressable
        onPress={isOnly ? undefined : () => onDelete(domain)}
        hitSlop={8}
        disabled={isOnly}
        style={({ pressed }) => [
          styles.iconBtn,
          isOnly ? styles.iconBtnDisabled : pressed && { opacity: 0.6 },
        ]}
        accessibilityRole="button"
        accessibilityLabel={isOnly ? t("org.profile.domainLastWarning") : t("org.actions.delete")}
      >
        <Ionicons
          name="trash-outline"
          size={16}
          color={isOnly ? theme.textMuted : theme.danger}
        />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: spacing.sm,
    borderTopWidth: StyleSheet.hairlineWidth,
    gap: spacing.sm,
  },
  iconBtn: {
    padding: spacing.xs,
  },
  iconBtnDisabled: {
    opacity: 0.4,
  },
});

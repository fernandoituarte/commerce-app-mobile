import React from "react";
import { Pressable, StyleSheet, Switch, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import { Input } from "@/shared/components/ui";
import { radius, spacing, typography, useTheme } from "@/core/theme";
import { BG_COLORS, TEXT_COLORS } from "../helpers/product.helpers";

interface ProductUIFormProps {
  backgroundColor: string;
  textColor: string;
  badge: string;
  highlight: boolean;
  sortOrder: string;
  onBgColorChange: (c: string) => void;
  onTextColorChange: (c: string) => void;
  onBadgeChange: (b: string) => void;
  onHighlightChange: (h: boolean) => void;
  onSortOrderChange: (s: string) => void;
}

export function ProductUIForm({
  backgroundColor,
  textColor,
  badge,
  highlight,
  sortOrder,
  onBgColorChange,
  onTextColorChange,
  onBadgeChange,
  onHighlightChange,
  onSortOrderChange,
}: ProductUIFormProps) {
  const { t } = useTranslation();
  const theme = useTheme();

  return (
    <>
      <Text style={[typography.bodySm, { color: theme.textMuted, marginBottom: spacing.sm }]}>
        {t("org.products.backgroundColor")}
      </Text>
      <View style={styles.colorGrid}>
        {BG_COLORS.map((c) => (
          <Pressable
            key={c}
            onPress={() => onBgColorChange(c)}
            style={[styles.swatch, { backgroundColor: c }, backgroundColor === c && styles.selected]}
          >
            {backgroundColor === c && <Ionicons name="checkmark" size={14} color="#fff" />}
          </Pressable>
        ))}
      </View>

      <Text style={[typography.bodySm, { color: theme.textMuted, marginBottom: spacing.sm }]}>
        {t("org.products.textColor")}
      </Text>
      <View style={styles.colorGrid}>
        {TEXT_COLORS.map((c) => (
          <Pressable
            key={c}
            onPress={() => onTextColorChange(c)}
            style={[
              styles.swatch,
              { backgroundColor: c, borderWidth: StyleSheet.hairlineWidth, borderColor: theme.border },
              textColor === c && styles.selected,
            ]}
          >
            {textColor === c && (
              <Ionicons name="checkmark" size={14} color={c === "#ffffff" ? "#000" : "#fff"} />
            )}
          </Pressable>
        ))}
      </View>

      <Input
        label={t("org.products.badge")}
        value={badge}
        onChangeText={onBadgeChange}
        placeholder={t("org.products.badgePlaceholder")}
      />

      <View style={styles.toggleRow}>
        <View style={{ flex: 1 }}>
          <Text style={[typography.body, { color: theme.text }]}>{t("org.products.highlight")}</Text>
          <Text style={[typography.caption, { color: theme.textMuted }]}>{t("org.products.highlightHint")}</Text>
        </View>
        <Switch
          value={highlight}
          onValueChange={onHighlightChange}
          trackColor={{ false: theme.border, true: theme.primary }}
        />
      </View>

      <Input
        label={t("org.products.sortOrder")}
        value={sortOrder}
        onChangeText={onSortOrderChange}
        keyboardType="number-pad"
        placeholder="0"
      />
    </>
  );
}

const styles = StyleSheet.create({
  colorGrid: { flexDirection: "row", flexWrap: "wrap", gap: spacing.sm, marginBottom: spacing.md },
  swatch: { width: 32, height: 32, borderRadius: 16, alignItems: "center", justifyContent: "center" },
  selected: { borderWidth: 3, borderColor: "#fff", shadowColor: "#000", shadowOpacity: 0.2, shadowRadius: 4, elevation: 4 },
  toggleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: spacing.md,
  },
});

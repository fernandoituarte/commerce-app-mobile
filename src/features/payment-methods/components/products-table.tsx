import React from "react";
import { Dimensions, FlatList, Image as RNImage, Pressable, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import { Badge, EmptyState } from "@/shared/components/ui";
import { radius, spacing, typography, useTheme } from "@/core/theme";
import type { Product, Products } from "../types";

interface ProductsTableProps {
  data: Products | undefined;
  isLoading: boolean;
  withDeleted: boolean;
  page: number;
  onPageChange: (p: number) => void;
  onEdit: (p: Product) => void;
  onDelete: (p: Product) => void;
  onRestore: (p: Product) => void;
  onCreateFirst: () => void;
}

export function ProductsTable({
  data, isLoading, page, onPageChange,
  onEdit, onDelete, onRestore, onCreateFirst,
}: ProductsTableProps) {
  const { t } = useTranslation();
  const theme = useTheme();

  const NUM_COLUMNS = theme.isTablet ? 3 : 2;
  const PADDING = spacing.sm;
  const GAP = spacing.sm / 2;
  const cardWidth = (Dimensions.get("window").width - PADDING * 2 - GAP * (NUM_COLUMNS + 1)) / NUM_COLUMNS;

  if (!isLoading && (!data || data.items.length === 0)) {
    return (
      <EmptyState
        icon="fast-food-outline"
        title={t("org.products.empty")}
        description={t("org.products.emptyDescription")}
        actionLabel={t("org.products.create")}
        onAction={onCreateFirst}
      />
    );
  }

  return (
    <FlatList
      data={data?.items ?? []}
      keyExtractor={(p) => p.id}
      numColumns={theme.isTablet ? 3 : 2}
      key={theme.isTablet ? "tablet" : "mobile"}
      contentContainerStyle={styles.grid}
      ListFooterComponent={
        data && data.totalPages > 1 ? (
          <View style={styles.pagination}>
            <Pressable disabled={page <= 1} onPress={() => onPageChange(page - 1)} style={[styles.pageBtn, page <= 1 && { opacity: 0.4 }]}>
              <Ionicons name="chevron-back" size={20} color={theme.primary} />
            </Pressable>
            <Text style={[typography.caption, { color: theme.textMuted }]}>{page} / {data.totalPages}</Text>
            <Pressable disabled={!data.hasMore} onPress={() => onPageChange(page + 1)} style={[styles.pageBtn, !data.hasMore && { opacity: 0.4 }]}>
              <Ionicons name="chevron-forward" size={20} color={theme.primary} />
            </Pressable>
          </View>
        ) : null
      }
      renderItem={({ item }) => (
        <Pressable
          onPress={() => onEdit(item)}
          style={({ pressed }) => [
            styles.card,
            { backgroundColor: theme.surfaceAlt, borderColor: theme.border, width: cardWidth, margin: GAP },
            !item.isActive && { opacity: 0.55 },
            pressed && { opacity: 0.85 },
          ]}
        >
          <View style={[styles.imgWrap, { backgroundColor: theme.surface }]}>
            {item.image?.url ? (
              <RNImage source={{ uri: item.image.url }} style={StyleSheet.absoluteFill} resizeMode="cover" />
            ) : (
              <Ionicons name="fast-food-outline" size={28} color={theme.textMuted} />
            )}
            {item.ui?.backgroundColor ? (
              <View style={[styles.colorBar, { backgroundColor: item.ui.backgroundColor }]} />
            ) : null}
            {!item.isActive && (
              <View style={[styles.overlay, { backgroundColor: "rgba(0,0,0,0.35)" }]}>
                <Text style={styles.overlayLabel}>{t("org.products.inactive")}</Text>
              </View>
            )}
            {item.stock === 0 && item.isActive && (
              <View style={[styles.overlay, { backgroundColor: "rgba(239,68,68,0.5)" }]}>
                <Text style={styles.overlayLabel}>{t("org.products.outOfStock")}</Text>
              </View>
            )}
            <Pressable
              hitSlop={8}
              onPress={() => !item.isActive ? onRestore(item) : onDelete(item)}
              style={styles.cardAction}
            >
              <Ionicons
                name={!item.isActive ? "refresh-outline" : "trash-outline"}
                size={14}
                color={!item.isActive ? theme.primary : theme.textMuted}
              />
            </Pressable>
          </View>
          <View style={styles.cardBody}>
            <Text style={[typography.body, { color: theme.text }]} numberOfLines={1}>{item.name}</Text>
            <View style={styles.cardRow}>
              <Text style={[typography.h3, { color: theme.primary }]}>${item.price.toFixed(2)}</Text>
              <Badge label={`${item.stock}`} tone={item.stock < 10 ? "danger" : "neutral"} />
            </View>
            {item.category?.name ? (
              <Text style={[typography.caption, { color: theme.textMuted }]} numberOfLines={1}>{item.category.name}</Text>
            ) : null}
          </View>
        </Pressable>
      )}
    />
  );
}

const styles = StyleSheet.create({
  grid: { padding: spacing.sm, paddingBottom: 80 },
  card: { borderRadius: radius.lg, borderWidth: StyleSheet.hairlineWidth, overflow: "hidden" },
  imgWrap: { height: 100, alignItems: "center", justifyContent: "center" },
  colorBar: { position: "absolute", bottom: 0, left: 0, right: 0, height: 3 },
  overlay: { ...StyleSheet.absoluteFillObject, alignItems: "center", justifyContent: "center" },
  overlayLabel: { color: "#fff", fontSize: 11, fontWeight: "700" },
  cardAction: { position: "absolute", top: 6, right: 6, backgroundColor: "rgba(255,255,255,0.85)", borderRadius: radius.sm, padding: 4 },
  cardBody: { padding: spacing.sm, gap: 4 },
  cardRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  pagination: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: spacing.md, paddingVertical: spacing.md },
  pageBtn: { padding: spacing.sm },
});

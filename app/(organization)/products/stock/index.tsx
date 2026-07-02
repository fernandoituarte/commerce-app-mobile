import React from "react";
import { Pressable, View, Text, StyleSheet, ScrollView } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import { OrgShell } from "@/shared/components/OrgShell";
import { Badge, EmptyState, SearchBar, Skeleton } from "@/shared/components/ui";
import { radius, spacing, typography, useTheme } from "@/core/theme";
import { useGetProducts } from "@/features/products/product/hooks";
import { EditStockModal } from "@/features/products/product/components/edit-stock-modal";
import type { Product } from "@/features/products/product/types";
import { useSubscriptionAccess } from "@/features/subscription/hooks/useSubscriptionAccess";

function isLowStock(item: Product): boolean {
  return (
    item.trackStock === true &&
    item.lowStockThreshold != null &&
    item.stock <= item.lowStockThreshold
  );
}

export default function StockScreen() {
  const { t } = useTranslation();
  const theme = useTheme();
  const { canWrite } = useSubscriptionAccess();
  const [query, setQuery] = React.useState("");
  const [editProduct, setEditProduct] = React.useState<Product | null>(null);

  const { data, isLoading } = useGetProducts({
    search: query || undefined,
    limit: 100,
  });

  const products = (data?.items ?? []).filter((p) => p.trackStock === true);
  const lowItems = products.filter(isLowStock);

  return (
    <OrgShell title={t("org.stock.title")} scrollable={false} padded={false}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        {/* Search */}
        <View style={styles.section}>
          <SearchBar
            value={query}
            onChangeText={setQuery}
            placeholder={t("org.stock.search")}
          />
        </View>

        {/* Low stock warnings */}
        {lowItems.length > 0 && (
          <View style={styles.section}>
            <View style={styles.warnHeader}>
              <Ionicons
                name="warning-outline"
                size={18}
                color={theme.warning}
              />
              <Text style={[typography.h3, { color: theme.text }]}>
                {t("org.stock.lowStockAlert", { count: lowItems.length })}
              </Text>
            </View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={styles.warnRow}>
                {lowItems.map((item) => (
                  <View
                    key={item.id}
                    style={[
                      styles.warnCard,
                      {
                        backgroundColor: theme.dangerSoft,
                        borderColor: theme.danger,
                      },
                    ]}
                  >
                    <Ionicons
                      name="cube-outline"
                      size={20}
                      color={theme.danger}
                    />
                    <Text
                      style={[typography.body, { color: theme.text }]}
                      numberOfLines={1}
                    >
                      {item.name}
                    </Text>
                    <View style={styles.warnQty}>
                      <Text style={[typography.h2, { color: theme.danger }]}>
                        {item.stock}
                      </Text>
                      {item.lowStockThreshold != null && (
                        <Text
                          style={[
                            typography.caption,
                            { color: theme.textMuted },
                          ]}
                        >
                          {t("org.stock.minLabel")}: {item.lowStockThreshold}
                        </Text>
                      )}
                    </View>
                  </View>
                ))}
              </View>
            </ScrollView>
          </View>
        )}

        {/* Loading state */}
        {isLoading && (
          <View style={styles.skelList}>
            {[100, 85, 70, 90, 60].map((w, i) => (
              <Skeleton key={i} width={`${w}%`} height={44} />
            ))}
          </View>
        )}

        {/* Empty state */}
        {!isLoading && products.length === 0 && (
          <EmptyState
            icon="cube-outline"
            title={t("org.stock.empty")}
            description={t("org.stock.emptyDescription")}
          />
        )}

        {/* Inventory */}
        {!isLoading &&
          products.length > 0 &&
          (theme.isTablet ? (
            <View
              style={[
                styles.table,
                {
                  backgroundColor: theme.surfaceAlt,
                  borderColor: theme.border,
                },
              ]}
            >
              <View
                style={[
                  styles.tableHeader,
                  {
                    backgroundColor: theme.surface,
                    borderBottomColor: theme.border,
                  },
                ]}
              >
                {[
                  t("org.stock.product"),
                  t("org.stock.current"),
                  t("org.stock.reserved"),
                  t("org.stock.minimum"),
                  t("org.stock.status"),
                ].map((h) => (
                  <Text
                    key={h}
                    style={[
                      styles.tableCell,
                      typography.caption,
                      { color: theme.textMuted },
                    ]}
                  >
                    {h.toUpperCase()}
                  </Text>
                ))}
                <View style={styles.tableCellAction} />
              </View>
              {products.map((item, idx) => {
                const low = isLowStock(item);
                return (
                  <View
                    key={item.id}
                    style={[
                      styles.tableRow,
                      { borderBottomColor: theme.border },
                      idx % 2 === 0 && { backgroundColor: theme.surface },
                    ]}
                  >
                    <Text
                      style={[
                        styles.tableCell,
                        typography.body,
                        { color: theme.text },
                      ]}
                    >
                      {item.name}
                    </Text>
                    <Text
                      style={[
                        styles.tableCell,
                        typography.body,
                        { color: low ? theme.danger : theme.text },
                      ]}
                    >
                      {item.stock}
                    </Text>
                    <Text
                      style={[
                        styles.tableCell,
                        typography.bodySm,
                        { color: theme.textMuted },
                      ]}
                    >
                      {item.reservedStock != null && item.reservedStock > 0
                        ? item.reservedStock
                        : "—"}
                    </Text>
                    <Text
                      style={[
                        styles.tableCell,
                        typography.bodySm,
                        { color: theme.textMuted },
                      ]}
                    >
                      {item.lowStockThreshold ?? "—"}
                    </Text>
                    <View style={styles.tableCell}>
                      <Badge
                        label={low ? t("org.stock.low") : t("org.stock.ok")}
                        tone={low ? "danger" : "success"}
                      />
                    </View>
                    <Pressable
                      style={({ pressed }) => [
                        styles.tableCellAction,
                        pressed && canWrite && { opacity: 0.6 },
                        !canWrite && { opacity: 0.4 },
                      ]}
                      disabled={!canWrite}
                      onPress={canWrite ? () => setEditProduct(item) : undefined}
                      hitSlop={8}
                    >
                      <Ionicons
                        name="create-outline"
                        size={18}
                        color={theme.primary}
                      />
                    </Pressable>
                  </View>
                );
              })}
            </View>
          ) : (
            <View style={styles.cardList}>
              {products.map((item) => {
                const low = isLowStock(item);
                const max = item.lowStockThreshold
                  ? item.lowStockThreshold * 5
                  : 100;
                const pct = Math.min(100, (item.stock / max) * 100);
                return (
                  <View
                    key={item.id}
                    style={[
                      styles.stockCard,
                      {
                        backgroundColor: theme.surfaceAlt,
                        borderColor: low ? theme.danger : theme.border,
                      },
                    ]}
                  >
                    <View style={styles.stockCardRow}>
                      <View
                        style={[
                          styles.stockIcon,
                          {
                            backgroundColor: low
                              ? theme.dangerSoft
                              : theme.primarySoft,
                          },
                        ]}
                      >
                        <Ionicons
                          name="cube-outline"
                          size={18}
                          color={low ? theme.danger : theme.primary}
                        />
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={[typography.body, { color: theme.text }]}>
                          {item.name}
                        </Text>
                        {item.lowStockThreshold != null && (
                          <Text
                            style={[
                              typography.caption,
                              { color: theme.textMuted },
                            ]}
                          >
                            {t("org.stock.minLabel")}: {item.lowStockThreshold}
                          </Text>
                        )}
                        {item.reservedStock != null &&
                          item.reservedStock > 0 && (
                            <Text
                              style={[
                                typography.caption,
                                { color: theme.textMuted },
                              ]}
                            >
                              {t("org.stock.reserved")}: {item.reservedStock}
                            </Text>
                          )}
                      </View>
                      <View style={styles.stockQty}>
                        <Text
                          style={[
                            typography.h2,
                            { color: low ? theme.danger : theme.text },
                          ]}
                        >
                          {item.stock}
                        </Text>
                        <Badge
                          label={low ? t("org.stock.low") : t("org.stock.ok")}
                          tone={low ? "danger" : "success"}
                        />
                      </View>
                      <Pressable
                        style={({ pressed }) => [
                          styles.editBtn,
                          pressed && canWrite && { opacity: 0.6 },
                          !canWrite && { opacity: 0.4 },
                        ]}
                        disabled={!canWrite}
                        onPress={canWrite ? () => setEditProduct(item) : undefined}
                        hitSlop={8}
                      >
                        <Ionicons
                          name="create-outline"
                          size={20}
                          color={theme.primary}
                        />
                      </Pressable>
                    </View>
                    <View
                      style={[
                        styles.progressBg,
                        { backgroundColor: theme.border },
                      ]}
                    >
                      <View
                        style={[
                          styles.progressFill,
                          {
                            width: `${pct}%`,
                            backgroundColor: low ? theme.danger : theme.success,
                          },
                        ]}
                      />
                    </View>
                  </View>
                );
              })}
            </View>
          ))}
      </ScrollView>

      <EditStockModal
        product={editProduct}
        onClose={() => setEditProduct(null)}
      />
    </OrgShell>
  );
}

const styles = StyleSheet.create({
  scroll: { padding: spacing.md, paddingBottom: spacing.xl, gap: spacing.md },
  section: { gap: spacing.sm },
  warnHeader: { flexDirection: "row", alignItems: "center", gap: spacing.sm },
  warnRow: {
    flexDirection: "row",
    gap: spacing.sm,
    paddingVertical: spacing.sm,
  },
  warnCard: {
    width: 140,
    padding: spacing.md,
    borderRadius: radius.lg,
    borderWidth: 1,
    gap: spacing.xs,
  },
  warnQty: {},
  skelList: { gap: spacing.sm },
  table: {
    borderRadius: radius.lg,
    borderWidth: StyleSheet.hairlineWidth,
    overflow: "hidden",
  },
  tableHeader: {
    flexDirection: "row",
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  tableRow: {
    flexDirection: "row",
    paddingVertical: spacing.sm + 2,
    paddingHorizontal: spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    alignItems: "center",
  },
  tableCell: { flex: 1 },
  tableCellAction: {
    width: 36,
    alignItems: "center",
    justifyContent: "center",
  },
  cardList: { gap: spacing.sm },
  stockCard: {
    padding: spacing.md,
    borderRadius: radius.lg,
    borderWidth: StyleSheet.hairlineWidth,
    gap: spacing.sm,
  },
  stockCardRow: { flexDirection: "row", alignItems: "center", gap: spacing.md },
  stockIcon: {
    width: 36,
    height: 36,
    borderRadius: radius.sm,
    alignItems: "center",
    justifyContent: "center",
  },
  stockQty: { alignItems: "flex-end", gap: 4 },
  editBtn: { padding: spacing.xs },
  progressBg: { height: 4, borderRadius: 2, overflow: "hidden" },
  progressFill: { height: 4, borderRadius: 2 },
});

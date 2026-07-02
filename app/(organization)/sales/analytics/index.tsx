import React from "react";
import { View, Text, ScrollView, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import { OrgShell } from "@/shared/components/OrgShell";
import { BarChart, LineChart, SectionTitle, StatCard } from "@/shared/components/ui";
import { radius, spacing, typography, useTheme } from "@/core/theme";
import { mockAnalytics } from "@/shared/mocks/organization";

const DAY_LABELS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export default function AnalyticsScreen() {
  const { t, i18n } = useTranslation();
  const theme = useTheme();
  const a = mockAnalytics;

  const fmt = (n: number) =>
    new Intl.NumberFormat(i18n.language, { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(n);

  return (
    <OrgShell title={t("org.analytics.title")} scrollable>
      {/* Stat cards */}
      <View style={[styles.statsGrid, theme.isTablet && styles.statsGridTablet]}>
        <StatCard icon="cash-outline" label={t("org.analytics.revenue")} value={fmt(a.revenueTotal)} change={a.revenueChange} changeLabel={t("org.analytics.vsLastMonth")} />
        <StatCard icon="receipt-outline" label={t("org.analytics.orders")} value={String(a.ordersTotal)} change={a.ordersChange} changeLabel={t("org.analytics.vsLastMonth")} />
        <StatCard icon="card-outline" label={t("org.analytics.avgOrder")} value={fmt(a.avgOrder)} change={a.avgOrderChange} changeLabel={t("org.analytics.vsLastMonth")} />
        <StatCard icon="person-add-outline" label={t("org.analytics.newClients")} value={String(a.newClients)} change={a.clientsChange} changeLabel={t("org.analytics.vsLastMonth")} />
      </View>

      {/* Revenue chart */}
      <View style={[styles.chartCard, { backgroundColor: theme.surfaceAlt, borderColor: theme.border }]}>
        <View style={styles.chartHeader}>
          <View>
            <Text style={[typography.h3, { color: theme.text }]}>{t("org.analytics.revenueChart")}</Text>
            <Text style={[typography.caption, { color: theme.textMuted }]}>{t("org.analytics.last7days")}</Text>
          </View>
          <Text style={[typography.h2, { color: theme.primary }]}>{fmt(a.revenueTotal)}</Text>
        </View>
        <BarChart data={a.revenueByDay} height={120} />
        <View style={styles.dayLabels}>
          {DAY_LABELS.map((d) => (
            <Text key={d} style={[styles.dayLabel, typography.caption, { color: theme.textMuted }]}>
              {d}
            </Text>
          ))}
        </View>
      </View>

      {/* Orders chart */}
      <View style={[styles.chartCard, { backgroundColor: theme.surfaceAlt, borderColor: theme.border }]}>
        <View style={styles.chartHeader}>
          <View>
            <Text style={[typography.h3, { color: theme.text }]}>{t("org.analytics.ordersChart")}</Text>
            <Text style={[typography.caption, { color: theme.textMuted }]}>{t("org.analytics.last7days")}</Text>
          </View>
          <Text style={[typography.h2, { color: theme.success }]}>{a.ordersTotal}</Text>
        </View>
        <LineChart data={a.ordersByDay} height={100} color={theme.success} />
      </View>

      {/* Top products */}
      <SectionTitle title={t("org.analytics.topProducts")} />
      <View style={[styles.topCard, { backgroundColor: theme.surfaceAlt, borderColor: theme.border }]}>
        {a.topProducts.map((p, i) => {
          const maxRev = a.topProducts[0].revenue;
          return (
            <View key={p.name}>
              <View style={styles.topRow}>
                <View
                  style={[
                    styles.rank,
                    { backgroundColor: i === 0 ? theme.warning : theme.surface },
                  ]}
                >
                  <Text
                    style={[
                      typography.caption,
                      { color: i === 0 ? "#fff" : theme.textMuted, fontWeight: "700" },
                    ]}
                  >
                    {i + 1}
                  </Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[typography.body, { color: theme.text }]}>{p.name}</Text>
                  <Text style={[typography.caption, { color: theme.textMuted }]}>
                    {p.orders} {t("org.analytics.orders")}
                  </Text>
                </View>
                <Text style={[typography.h3, { color: theme.text }]}>{fmt(p.revenue)}</Text>
              </View>
              {/* Bar indicator */}
              <View style={[styles.barBg, { backgroundColor: theme.border }]}>
                <View
                  style={[
                    styles.barFill,
                    {
                      width: `${(p.revenue / maxRev) * 100}%`,
                      backgroundColor: i === 0 ? theme.primary : theme.primarySoft,
                    },
                  ]}
                />
              </View>
              {i < a.topProducts.length - 1 && (
                <View style={[styles.divider, { backgroundColor: theme.border }]} />
              )}
            </View>
          );
        })}
      </View>
    </OrgShell>
  );
}

const styles = StyleSheet.create({
  statsGrid: { flexDirection: "row", flexWrap: "wrap", gap: spacing.sm, marginBottom: spacing.lg },
  statsGridTablet: { flexWrap: "nowrap" },
  chartCard: {
    padding: spacing.lg,
    borderRadius: radius.lg,
    borderWidth: StyleSheet.hairlineWidth,
    marginBottom: spacing.lg,
  },
  chartHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: spacing.md,
  },
  dayLabels: { flexDirection: "row", justifyContent: "space-around", marginTop: spacing.xs },
  dayLabel: { flex: 1, textAlign: "center" },
  topCard: {
    padding: spacing.lg,
    borderRadius: radius.lg,
    borderWidth: StyleSheet.hairlineWidth,
  },
  topRow: { flexDirection: "row", alignItems: "center", gap: spacing.md, paddingVertical: spacing.sm },
  rank: { width: 28, height: 28, borderRadius: 14, alignItems: "center", justifyContent: "center" },
  barBg: { height: 4, borderRadius: 2, marginBottom: spacing.sm, overflow: "hidden" },
  barFill: { height: 4, borderRadius: 2 },
  divider: { height: StyleSheet.hairlineWidth },
});

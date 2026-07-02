import React from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import { useTranslation } from "react-i18next";
import { radius, spacing, typography, useTheme } from "@/core/theme";
import type { Product } from "@/features/products/product/types";

interface ProductCardProps {
  product: Product;
  onPress?: () => void;
  // Long-press opens the product edit modal. Not gated by availability —
  // an admin may want to edit an unavailable product to re-enable it.
  onLongPress?: () => void;
}

export function ProductCard({ product, onPress, onLongPress }: ProductCardProps) {
  const { t } = useTranslation();
  const theme = useTheme();
  const available = product.availability === "AVAILABLE" && product.isActive;

  const backgroundColor = available
    ? (product.ui?.backgroundColor ?? theme.surfaceAlt)
    : theme.surface;

  const textColor = available
    ? (product.ui?.textColor ?? theme.text)
    : theme.textMuted;

  return (
    <Pressable
      onPress={available ? onPress : undefined}
      onLongPress={onLongPress}
      accessibilityRole="button"
      style={({ pressed }) => [
        styles.card,
        {
          backgroundColor,
          borderColor: theme.border,
        },
        pressed && available && { opacity: 0.75, transform: [{ scale: 0.97 }] },
      ]}
    >
      <Text
        style={[
          typography.bodySm,
          {
            color: textColor,
            fontWeight: "600",
            textAlign: "center",
          },
        ]}
        numberOfLines={2}
      >
        {product.name}
      </Text>

      {product.ui?.badge && (
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{product.ui.badge}</Text>
        </View>
      )}

      <Text
        style={[
          typography.caption,
          {
            color: textColor,
            fontWeight: "700",
            textAlign: "center",
          },
        ]}
      >
        ${product.price.toFixed(2)}
      </Text>

      {!available && (
        <View style={styles.overlay}>
          <Text
            style={[typography.caption, { color: "#fff", fontWeight: "700" }]}
          >
            {t("pos.products.unavailable")}
          </Text>
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    borderRadius: radius.lg,
    borderWidth: StyleSheet.hairlineWidth,
    padding: spacing.sm,
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    overflow: "hidden",
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.45)",
    borderRadius: radius.lg,
    alignItems: "center",
    justifyContent: "center",
  },
  badge: {
    position: "absolute",
    top: 6,
    right: 6,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 999,
    backgroundColor: "rgba(255,255,255,0.2)",
  },

  badgeText: {
    color: "#fff",
    fontSize: 10,
    fontWeight: "700",
  },
});

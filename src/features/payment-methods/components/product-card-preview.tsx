import React from "react";
import { Image as RNImage, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import { radius, spacing, typography, useTheme } from "@/core/theme";

interface ProductCardPreviewProps {
  name: string;
  price: string;
  imageUrl: string;
  badge: string;
  backgroundColor: string;
  textColor: string;
  highlight: boolean;
  categoryName: string;
}

export function ProductCardPreview({
  name,
  price,
  imageUrl,
  badge,
  backgroundColor,
  textColor,
  highlight,
  categoryName,
}: ProductCardPreviewProps) {
  const { t } = useTranslation();
  const theme = useTheme();

  return (
    <View
      style={[
        styles.card,
        { backgroundColor: theme.surfaceAlt, borderColor: backgroundColor },
      ]}
    >
      <View style={[styles.img, { backgroundColor }]}>
        {imageUrl ? (
          <RNImage source={{ uri: imageUrl }} style={StyleSheet.absoluteFill} resizeMode="cover" />
        ) : (
          <Ionicons name="fast-food-outline" size={22} color={textColor} />
        )}
        {badge ? (
          <View style={[styles.badge, { backgroundColor: `${textColor}33` }]}>
            <Text style={[typography.caption, { color: textColor, fontWeight: "600" }]}>
              {badge}
            </Text>
          </View>
        ) : null}
      </View>

      <View style={styles.body}>
        <Text style={[typography.body, { color: theme.text }]} numberOfLines={1}>
          {name || t("org.products.name")}
        </Text>
        <Text style={[typography.h3, { color: theme.primary }]}>
          ${parseFloat(price || "0").toFixed(2)}
        </Text>
        {categoryName ? (
          <Text style={[typography.caption, { color: theme.textMuted }]}>{categoryName}</Text>
        ) : null}
      </View>

      {highlight ? (
        <Ionicons
          name="star"
          size={16}
          color={backgroundColor}
          style={{ marginRight: spacing.sm }}
        />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: radius.lg,
    borderWidth: 2,
    overflow: "hidden",
    marginBottom: spacing.md,
  },
  img: { width: 72, height: 72, alignItems: "center", justifyContent: "center" },
  badge: {
    position: "absolute",
    bottom: 4,
    left: 4,
    paddingHorizontal: 5,
    paddingVertical: 2,
    borderRadius: radius.pill,
  },
  body: { flex: 1, padding: spacing.sm, gap: 2 },
});

import React, { useState } from "react";
import { ActivityIndicator, Image as RNImage, Pressable, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { useTranslation } from "react-i18next";
import { radius, spacing, typography, useTheme } from "@/core/theme";
import { mediaService } from "@/features/media/api/media.service";
import { MAX_IMAGE_SIZE, ACCEPTED_IMAGE_MIME } from "../helpers/product.helpers";

interface ProductImageUploaderProps {
  imageUrl: string;
  imageKey: string;
  onImageChange: (url: string, key: string) => void;
}

export function ProductImageUploader({
  imageUrl,
  imageKey,
  onImageChange,
}: ProductImageUploaderProps) {
  const { t } = useTranslation();
  const theme = useTheme();
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  const handlePick = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      quality: 0.85,
    });
    if (result.canceled) return;

    const asset = result.assets[0];
    const mime = asset.mimeType ?? "";

    if (!ACCEPTED_IMAGE_MIME.includes(mime)) {
      setError(t("org.products.imageFormatError"));
      return;
    }
    if (asset.fileSize && asset.fileSize > MAX_IMAGE_SIZE) {
      setError(t("org.products.imageSizeError"));
      return;
    }

    setError("");
    setUploading(true);
    try {
      if (imageKey) {
        await mediaService.delete(imageKey);
        onImageChange("", "");
      }

      const fd = new FormData();
      fd.append("file", {
        uri: asset.uri,
        name: asset.fileName ?? `product_${Date.now()}.jpg`,
        type: mime,
      } as any);

      const uploaded = await mediaService.upload(fd);
      onImageChange(uploaded.url, uploaded.key);
    } catch {
      setError(t("org.products.imageUploadError"));
    } finally {
      setUploading(false);
    }
  };

  return (
    <>
      {imageUrl ? (
        <View style={styles.preview}>
          <RNImage source={{ uri: imageUrl }} style={styles.thumb} resizeMode="cover" />
          <Pressable
            onPress={handlePick}
            disabled={uploading}
            style={[styles.changeBtn, { backgroundColor: theme.primarySoft }]}
          >
            {uploading ? (
              <ActivityIndicator size="small" color={theme.primary} />
            ) : (
              <>
                <Ionicons name="camera-outline" size={16} color={theme.primary} />
                <Text style={[typography.caption, { color: theme.primary }]}>
                  {t("org.products.changeImage")}
                </Text>
              </>
            )}
          </Pressable>
        </View>
      ) : (
        <Pressable
          onPress={handlePick}
          disabled={uploading}
          style={[styles.placeholder, { backgroundColor: theme.surface, borderColor: theme.border }]}
        >
          {uploading ? (
            <ActivityIndicator size="small" color={theme.primary} />
          ) : (
            <>
              <Ionicons name="image-outline" size={28} color={theme.textMuted} />
              <Text style={[typography.caption, { color: theme.primary }]}>
                {t("org.products.addImage")}
              </Text>
              <Text style={[typography.caption, { color: theme.textMuted }]}>
                {t("org.products.imageHint")}
              </Text>
            </>
          )}
        </Pressable>
      )}
      {error ? (
        <Text style={[typography.caption, { color: theme.danger, marginBottom: spacing.sm }]}>
          {error}
        </Text>
      ) : null}
    </>
  );
}

const styles = StyleSheet.create({
  preview: { flexDirection: "row", gap: spacing.md, marginBottom: spacing.md, alignItems: "center" },
  thumb: { width: 80, height: 80, borderRadius: radius.md },
  changeBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.xs,
    padding: spacing.sm,
    borderRadius: radius.md,
    minHeight: 44,
  },
  placeholder: {
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.xs,
    height: 90,
    borderRadius: radius.md,
    borderWidth: StyleSheet.hairlineWidth,
    marginBottom: spacing.sm,
  },
});

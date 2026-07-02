import React from "react";
import { View, Text, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { OrgShell } from "@/shared/components/OrgShell";
import { Avatar, Button, Input } from "@/shared/components/ui";
import { spacing, typography, useTheme } from "@/core/theme";
import {
  useCreateOrganization,
  useUpdateOrganization,
} from "@/features/organization/hooks/useOrganization";
import { orgProfileSchema } from "@/features/organization/validations";
import { styles } from "../profile";
import { useRouter } from "expo-router";

type OrgProfileForm = z.infer<typeof orgProfileSchema>;

export default function OrgProfileScreen() {
  const { t } = useTranslation();
  const theme = useTheme();
  const router = useRouter();

  const { mutate: createOrg, isPending } = useCreateOrganization();

  const {
    control,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<OrgProfileForm>({
    resolver: zodResolver(orgProfileSchema),
    defaultValues: {
      name: "",
      address: "",
      contactEmail: "",
      contactPhone: "",
    },
  });

  const orgName = watch("name");

  function onSubmit(values: OrgProfileForm) {
    createOrg(values, {
      onSuccess: () => router.replace("/(organization)/profile"),
    });
  }

  return (
    <OrgShell title={t("org.profile.title")} scrollable keyboard>
      {/* Logo section */}
      <View
        style={[
          styles.logoCard,
          { backgroundColor: theme.surfaceAlt, borderColor: theme.border },
        ]}
      >
        <View style={styles.logoRow}>
          <View style={styles.logoWrap}>
            <Avatar name={orgName} size="xl" />
            <Pressable
              style={({ pressed }) => [
                styles.cameraBtn,
                { backgroundColor: theme.primary, borderColor: theme.bg },
                pressed && { opacity: 0.8 },
              ]}
              accessibilityRole="button"
              accessibilityLabel={t("org.profile.changeLogo")}
            >
              <Ionicons name="camera" size={14} color="#fff" />
            </Pressable>
          </View>
          <View style={styles.logoMeta}>
            <Text style={[typography.h3, { color: theme.text }]}>
              {orgName}
            </Text>
            <Text style={[typography.bodySm, { color: theme.textMuted }]}>
              {t("org.profile.logoHint")}
            </Text>
          </View>
        </View>
      </View>

      {/* Info section */}
      <View
        style={[
          styles.section,
          { backgroundColor: theme.surfaceAlt, borderColor: theme.border },
        ]}
      >
        <Text
          style={[
            typography.caption,
            {
              color: theme.textMuted,
              letterSpacing: 0.5,
              marginBottom: spacing.md,
            },
          ]}
        >
          {t("org.profile.infoSection").toUpperCase()}
        </Text>
        <Controller
          control={control}
          name="name"
          render={({ field: { value, onChange, onBlur } }) => (
            <Input
              label={t("org.profile.name")}
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              error={errors.name?.message}
            />
          )}
        />
        <Controller
          control={control}
          name="address"
          render={({ field: { value, onChange, onBlur } }) => (
            <Input
              label={t("org.profile.address")}
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              error={errors.address?.message}
              multiline
            />
          )}
        />
        <Controller
          control={control}
          name="contactEmail"
          render={({ field: { value, onChange, onBlur } }) => (
            <Input
              label={t("org.profile.contactEmail")}
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              error={errors.contactEmail?.message}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          )}
        />
        <Controller
          control={control}
          name="contactPhone"
          render={({ field: { value, onChange, onBlur } }) => (
            <Input
              label={t("org.profile.contactPhone")}
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              error={errors.contactPhone?.message}
              keyboardType="phone-pad"
            />
          )}
        />
      </View>

      <Button
        title={t("org.actions.save")}
        style={{ marginTop: spacing.sm }}
        onPress={handleSubmit(onSubmit)}
        disabled={isPending}
      />
    </OrgShell>
  );
}

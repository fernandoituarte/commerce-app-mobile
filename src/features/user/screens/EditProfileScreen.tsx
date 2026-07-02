import React from "react";
import { View, Text, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Alert } from "react-native";
import { useForm, Controller } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { useUpdateProfile } from "../hooks";
import { Button, Input } from "../../../shared/components";
import { colors } from "../../../core/theme";
import type { UpdateProfileRequest } from "../types";

export function EditProfileScreen() {
  const { t } = useTranslation();
  const updateMutation = useUpdateProfile();

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<UpdateProfileRequest>({
    defaultValues: { name: "", phone: "" },
  });

  const onSubmit = (data: UpdateProfileRequest) => {
    updateMutation.mutate(data, {
      onSuccess: () => {
        Alert.alert(t("common.success"), t("user.editProfile.success"));
      },
    });
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.header}>
          <Text style={styles.title}>{t("user.editProfile.title")}</Text>
          <Text style={styles.subtitle}>{t("user.editProfile.subtitle")}</Text>
        </View>

        <Controller
          control={control}
          name="name"
          rules={{ required: t("user.editProfile.nameRequired") }}
          render={({ field: { onChange, onBlur, value } }) => (
            <Input
              label={t("user.editProfile.nameLabel")}
              placeholder={t("user.editProfile.namePlaceholder")}
              autoComplete="name"
              onBlur={onBlur}
              onChangeText={onChange}
              value={value}
              error={errors.name?.message}
            />
          )}
        />

        <Controller
          control={control}
          name="phone"
          render={({ field: { onChange, onBlur, value } }) => (
            <Input
              label={t("user.editProfile.phoneLabel")}
              placeholder={t("user.editProfile.phonePlaceholder")}
              keyboardType="phone-pad"
              autoComplete="tel"
              onBlur={onBlur}
              onChangeText={onChange}
              value={value}
              error={errors.phone?.message}
            />
          )}
        />

        {updateMutation.isError && (
          <Text style={styles.errorText}>
            {(updateMutation.error as { message?: string })?.message ??
              t("user.editProfile.error")}
          </Text>
        )}

        <Button
          title={t("user.editProfile.save")}
          loading={updateMutation.isPending}
          onPress={handleSubmit(onSubmit)}
        />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.light,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingVertical: 48,
  },
  header: {
    marginBottom: 32,
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    color: colors.text.light,
  },
  subtitle: {
    marginTop: 8,
    fontSize: 14,
    color: "#64748b",
  },
  errorText: {
    marginBottom: 16,
    textAlign: "center",
    fontSize: 14,
    color: colors.error,
  },
});

import React from "react";
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, Alert } from "react-native";
import { useForm, Controller } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { useChangePassword } from "../hooks";
import { Button, Input } from "../../../shared/components";
import { colors } from "../../../core/theme";
import type { ChangePasswordRequest } from "../types";

export function ChangePasswordScreen() {
  const { t } = useTranslation();
  const changeMutation = useChangePassword();

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ChangePasswordRequest>({
    defaultValues: { currentPassword: "", newPassword: "" },
  });

  const onSubmit = (data: ChangePasswordRequest) => {
    changeMutation.mutate(data, {
      onSuccess: () => {
        Alert.alert(t("common.success"), t("user.changePassword.success"));
        reset();
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
        <Text style={styles.title}>{t("user.changePassword.title")}</Text>
        <Text style={styles.subtitle}>{t("user.changePassword.subtitle")}</Text>

        <Controller
          control={control}
          name="currentPassword"
          rules={{ required: t("user.changePassword.currentRequired") }}
          render={({ field: { onChange, onBlur, value } }) => (
            <Input
              label={t("user.changePassword.currentLabel")}
              placeholder="••••••••"
              isPassword
              onBlur={onBlur}
              onChangeText={onChange}
              value={value}
              error={errors.currentPassword?.message}
            />
          )}
        />

        <Controller
          control={control}
          name="newPassword"
          rules={{
            required: t("user.changePassword.newRequired"),
            minLength: { value: 8, message: t("user.changePassword.minLength") },
          }}
          render={({ field: { onChange, onBlur, value } }) => (
            <Input
              label={t("user.changePassword.newLabel")}
              placeholder="••••••••"
              isPassword
              onBlur={onBlur}
              onChangeText={onChange}
              value={value}
              error={errors.newPassword?.message}
            />
          )}
        />

        {changeMutation.isError && (
          <Text style={styles.errorText}>
            {(changeMutation.error as { message?: string })?.message ??
              t("user.changePassword.error")}
          </Text>
        )}

        <Button
          title={t("user.changePassword.submit")}
          loading={changeMutation.isPending}
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
  title: {
    fontSize: 24,
    fontWeight: "700",
    color: colors.text.light,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: "#64748b",
    marginBottom: 32,
  },
  errorText: {
    marginBottom: 16,
    textAlign: "center",
    fontSize: 14,
    color: colors.error,
  },
});

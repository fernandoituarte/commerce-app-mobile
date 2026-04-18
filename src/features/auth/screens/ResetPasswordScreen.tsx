import React from "react";
import { View, Text, KeyboardAvoidingView, Platform, ScrollView, StyleSheet } from "react-native";
import { useForm, Controller } from "react-hook-form";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useTranslation } from "react-i18next";
import { useResetPassword } from "../hooks/useAuth";
import { Button, Input } from "../../../shared/components";
import { colors } from "../../../core/theme";
import type { ResetPasswordRequest } from "../types";

type ResetPasswordForm = Omit<ResetPasswordRequest, "token"> & { confirmPassword: string };

export function ResetPasswordScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const { token } = useLocalSearchParams<{ token: string }>();
  const resetMutation = useResetPassword();

  const {
    control,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<ResetPasswordForm>({
    defaultValues: { password: "", confirmPassword: "" },
  });

  const password = watch("password");

  const onSubmit = ({ confirmPassword, ...data }: ResetPasswordForm) => {
    resetMutation.mutate({ ...data, token: token ?? "" });
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
        {/* ── Header ─────────────────────────────────── */}
        <View style={styles.header}>
          <Text style={styles.title}>{t("resetPassword.title")}</Text>
          <Text style={styles.subtitle}>{t("resetPassword.subtitle")}</Text>
        </View>

        {/* ── Form ───────────────────────────────────── */}
        <Controller
          control={control}
          name="password"
          rules={{
            required: t("validation.passwordRequired"),
            minLength: { value: 8, message: t("validation.passwordMin8") },
          }}
          render={({ field: { onChange, onBlur, value } }) => (
            <Input
              label={t("resetPassword.newPassword")}
              placeholder={t("common.passwordPlaceholder")}
              isPassword
              onBlur={onBlur}
              onChangeText={onChange}
              value={value}
              error={errors.password?.message}
            />
          )}
        />

        <Controller
          control={control}
          name="confirmPassword"
          rules={{
            required: t("validation.confirmPasswordRequired"),
            validate: (value) => value === password || t("validation.passwordsMismatch"),
          }}
          render={({ field: { onChange, onBlur, value } }) => (
            <Input
              label={t("resetPassword.confirmNewPassword")}
              placeholder={t("common.passwordPlaceholder")}
              isPassword
              onBlur={onBlur}
              onChangeText={onChange}
              value={value}
              error={errors.confirmPassword?.message}
            />
          )}
        />

        {/* ── Success Message ────────────────────────── */}
        {resetMutation.isSuccess && (
          <Text style={styles.successText}>
            {resetMutation.data?.message ?? t("resetPassword.success")}
          </Text>
        )}

        {/* ── Error Message ──────────────────────────── */}
        {resetMutation.isError && (
          <Text style={styles.errorText}>
            {(resetMutation.error as { message?: string })?.message ??
              t("resetPassword.error")}
          </Text>
        )}

        {/* ── Submit ─────────────────────────────────── */}
        <Button
          title={t("resetPassword.resetPassword")}
          loading={resetMutation.isPending}
          onPress={handleSubmit(onSubmit)}
        />

        {/* ── Back to Login ──────────────────────────── */}
        <Text
          style={styles.backLink}
          onPress={() => router.replace("/login")}
        >
          {t("resetPassword.backToSignIn")}
        </Text>
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
    justifyContent: "center",
    paddingHorizontal: 24,
    paddingVertical: 48,
  },
  header: {
    marginBottom: 40,
  },
  title: {
    fontSize: 30,
    fontWeight: "700",
    color: colors.text.light,
  },
  subtitle: {
    marginTop: 8,
    fontSize: 16,
    color: "#64748b",
  },
  successText: {
    marginBottom: 16,
    textAlign: "center",
    fontSize: 14,
    color: colors.success,
  },
  errorText: {
    marginBottom: 16,
    textAlign: "center",
    fontSize: 14,
    color: colors.error,
  },
  backLink: {
    marginTop: 24,
    textAlign: "center",
    fontSize: 14,
    fontWeight: "600",
    color: colors.primary[600],
  },
});

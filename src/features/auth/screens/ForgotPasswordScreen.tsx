import React from "react";
import { View, Text, KeyboardAvoidingView, Platform, ScrollView, StyleSheet } from "react-native";
import { useForm, Controller } from "react-hook-form";
import { useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import { useForgotPassword } from "../hooks/useAuth";
import { Button, Input } from "../../../shared/components";
import { colors } from "../../../core/theme";
import type { ForgotPasswordRequest } from "../types";

export function ForgotPasswordScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const forgotMutation = useForgotPassword();

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordRequest>({
    defaultValues: { email: "" },
  });

  const onSubmit = (data: ForgotPasswordRequest) => {
    forgotMutation.mutate(data);
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
          <Text style={styles.title}>{t("forgotPassword.title")}</Text>
          <Text style={styles.subtitle}>
            {t("forgotPassword.subtitle")}
          </Text>
        </View>

        {/* ── Form ───────────────────────────────────── */}
        <Controller
          control={control}
          name="email"
          rules={{
            required: t("validation.emailRequired"),
            pattern: {
              value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
              message: t("validation.emailInvalid"),
            },
          }}
          render={({ field: { onChange, onBlur, value } }) => (
            <Input
              label={t("common.email")}
              placeholder={t("common.emailPlaceholder")}
              keyboardType="email-address"
              autoComplete="email"
              onBlur={onBlur}
              onChangeText={onChange}
              value={value}
              error={errors.email?.message}
            />
          )}
        />

        {/* ── Success Message ────────────────────────── */}
        {forgotMutation.isSuccess && (
          <Text style={styles.successText}>
            {forgotMutation.data?.message ?? t("forgotPassword.success")}
          </Text>
        )}

        {/* ── Error Message ──────────────────────────── */}
        {forgotMutation.isError && (
          <Text style={styles.errorText}>
            {(forgotMutation.error as { message?: string })?.message ??
              t("forgotPassword.error")}
          </Text>
        )}

        {/* ── Submit ─────────────────────────────────── */}
        <Button
          title={t("forgotPassword.sendLink")}
          loading={forgotMutation.isPending}
          onPress={handleSubmit(onSubmit)}
        />

        {/* ── Back to Login ──────────────────────────── */}
        <Text
          style={styles.backLink}
          onPress={() => router.back()}
        >
          {t("forgotPassword.backToSignIn")}
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

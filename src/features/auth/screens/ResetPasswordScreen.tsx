import React, { useMemo } from "react";
import { View, Text, KeyboardAvoidingView, Platform, ScrollView, StyleSheet } from "react-native";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useTranslation } from "react-i18next";
import { useResetPassword } from "../hooks/useAuth";
import { Button, Input } from "../../../shared/components";
import { colors } from "../../../core/theme";

type ResetForm = {
  code: string;
  password: string;
  confirmPassword: string;
};

export function ResetPasswordScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const { email = "" } = useLocalSearchParams<{ email: string }>();
  const resetMutation = useResetPassword();

  const schema = useMemo(
    () =>
      z
        .object({
          code: z
            .string()
            .min(1, t("resetPassword.invalidCode"))
            .regex(/^\d{6}$/, t("resetPassword.invalidCode")),
          password: z
            .string()
            .min(1, t("validation.passwordRequired"))
            .regex(
              /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^a-zA-Z\d]).{8,}$/,
              t("validation.passwordStrong"),
            ),
          confirmPassword: z.string().min(1, t("validation.confirmPasswordRequired")),
        })
        .refine((v) => v.password === v.confirmPassword, {
          message: t("validation.passwordsMismatch"),
          path: ["confirmPassword"],
        }),
    [t],
  );

  const {
    control,
    handleSubmit,
    setError,
    clearErrors,
    formState: { errors, isValid },
  } = useForm<ResetForm>({
    resolver: zodResolver(schema),
    defaultValues: { code: "", password: "", confirmPassword: "" },
    mode: "onChange",
  });

  const onSubmit = ({ code, password }: ResetForm) => {
    resetMutation.mutate(
      { email, code: code.trim(), password },
      {
        onSuccess: () => {
          router.replace("/login");
        },
        onError: (err) => {
          const message =
            err.statusCode === 429
              ? t("resetPassword.rateLimitError")
              : err.message || t("resetPassword.error");
          setError("code", { type: "server", message });
        },
      },
    );
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

        {/* ── OTP code ───────────────────────────────── */}
        <Controller
          control={control}
          name="code"
          render={({ field: { onChange, onBlur, value } }) => (
            <Input
              label={t("resetPassword.codeLabel")}
              value={value}
              onChangeText={(text) => {
                onChange(text);
                if (errors.code?.type === "server") clearErrors("code");
              }}
              onBlur={onBlur}
              placeholder={t("resetPassword.codePlaceholder")}
              keyboardType="number-pad"
              maxLength={6}
              autoComplete="one-time-code"
              autoFocus
              error={errors.code?.message}
            />
          )}
        />

        {/* ── New password ───────────────────────────── */}
        <Controller
          control={control}
          name="password"
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

        {/* ── Confirm password ───────────────────────── */}
        <Controller
          control={control}
          name="confirmPassword"
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

        {/* ── Error Message ──────────────────────────── */}
        {resetMutation.isError && !errors.code && (
          <Text style={styles.errorText}>
            {resetMutation.error?.message ?? t("resetPassword.error")}
          </Text>
        )}

        {/* ── Submit ─────────────────────────────────── */}
        <Button
          title={t("resetPassword.resetPassword")}
          loading={resetMutation.isPending}
          disabled={!isValid || resetMutation.isPending}
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

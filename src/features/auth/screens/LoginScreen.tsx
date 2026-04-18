import React from "react";
import { View, Text, KeyboardAvoidingView, Platform, ScrollView, StyleSheet } from "react-native";
import { useForm, Controller } from "react-hook-form";
import { useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import { useLogin } from "../hooks/useAuth";
import { useGoogleAuth } from "../hooks/useGoogleAuth";
import { Button, Input } from "../../../shared/components";
import { colors } from "../../../core/theme";
import type { LoginRequest } from "../types";

export function LoginScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const loginMutation = useLogin();
  const { signInWithGoogle, isLoading: googleLoading, isError: googleError, error: googleAuthError } = useGoogleAuth();

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginRequest>({
    defaultValues: { email: "", password: "" },
  });

  const onSubmit = (data: LoginRequest) => {
    loginMutation.mutate(data);
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
          <Text style={styles.title}>{t("login.title")}</Text>
          <Text style={styles.subtitle}>{t("login.subtitle")}</Text>
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

        <Controller
          control={control}
          name="password"
          rules={{
            required: t("validation.passwordRequired"),
            minLength: { value: 6, message: t("validation.passwordMin6") },
          }}
          render={({ field: { onChange, onBlur, value } }) => (
            <Input
              label={t("common.password")}
              placeholder={t("common.passwordPlaceholder")}
              isPassword
              onBlur={onBlur}
              onChangeText={onChange}
              value={value}
              error={errors.password?.message}
            />
          )}
        />

        {/* ── Forgot Password Link ───────────────────── */}
        <Text
          style={styles.forgotLink}
          onPress={() => router.push("/forgot-password")}
        >
          {t("login.forgotPassword")}
        </Text>

        {/* ── Error Message ──────────────────────────── */}
        {loginMutation.isError && (
          <Text style={styles.errorText}>
            {(loginMutation.error as { message?: string })?.message ??
              t("login.error")}
          </Text>
        )}

        {/* ── Submit ─────────────────────────────────── */}
        <Button
          title={t("login.signIn")}
          loading={loginMutation.isPending}
          onPress={handleSubmit(onSubmit)}
        />

        {/* ── Divider ────────────────────────────────── */}
        <View style={styles.divider}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerText}>{t("login.orContinueWith")}</Text>
          <View style={styles.dividerLine} />
        </View>

        {/* ── Google Sign In ─────────────────────────── */}
        <Button
          title={t("login.googleButton")}
          variant="outline"
          loading={googleLoading}
          onPress={signInWithGoogle}
        />

        {googleError && (
          <Text style={styles.errorText}>
            {googleAuthError?.message ?? t("login.googleError")}
          </Text>
        )}

        {/* ── Register Link ──────────────────────────── */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            {t("login.noAccount")}{" "}
          </Text>
          <Text
            style={styles.footerLink}
            onPress={() => router.push("/register")}
          >
            {t("login.signUp")}
          </Text>
        </View>
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
  forgotLink: {
    alignSelf: "flex-end",
    marginBottom: 24,
    fontSize: 14,
    color: colors.primary[600],
  },
  divider: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 20,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: "#e2e8f0",
  },
  dividerText: {
    marginHorizontal: 12,
    fontSize: 14,
    color: "#94a3b8",
  },
  errorText: {
    marginBottom: 16,
    textAlign: "center",
    fontSize: 14,
    color: colors.error,
  },
  footer: {
    marginTop: 24,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  footerText: {
    fontSize: 14,
    color: "#64748b",
  },
  footerLink: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.primary[600],
  },
});

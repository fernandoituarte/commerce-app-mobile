import React from "react";
import { View, Text, KeyboardAvoidingView, Platform, ScrollView, StyleSheet } from "react-native";
import { useForm, Controller } from "react-hook-form";
import { useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import { useRegister } from "../hooks/useAuth";
import { useGoogleAuth } from "../hooks/useGoogleAuth";
import { Button, Input } from "../../../shared/components";
import { colors } from "../../../core/theme";
import type { RegisterRequest } from "../types";

type RegisterForm = RegisterRequest & { confirmPassword: string };

export function RegisterScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const registerMutation = useRegister();
  const { signInWithGoogle, isLoading: googleLoading, isError: googleError, error: googleAuthError } = useGoogleAuth();

  const {
    control,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<RegisterForm>({
    defaultValues: { name: "", email: "", password: "", confirmPassword: "" },
  });

  const password = watch("password");

  const onSubmit = ({ confirmPassword, ...data }: RegisterForm) => {
    registerMutation.mutate(data, {
      onSuccess: () => {
        router.push({ pathname: "/verify-email", params: { email: data.email } });
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
        {/* ── Header ─────────────────────────────────── */}
        <View style={styles.header}>
          <Text style={styles.title}>{t("register.title")}</Text>
          <Text style={styles.subtitle}>{t("register.subtitle")}</Text>
        </View>

        {/* ── Form ───────────────────────────────────── */}
        <Controller
          control={control}
          name="name"
          rules={{ required: t("validation.nameRequired") }}
          render={({ field: { onChange, onBlur, value } }) => (
            <Input
              label={t("register.fullName")}
              placeholder={t("register.fullNamePlaceholder")}
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
            minLength: { value: 8, message: t("validation.passwordMin8") },
            validate: (value) =>
              /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^a-zA-Z\d]).{8,}$/.test(value) ||
              t("validation.passwordStrong"),
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

        <Controller
          control={control}
          name="confirmPassword"
          rules={{
            required: t("validation.confirmPasswordRequired"),
            validate: (value) => value === password || t("validation.passwordsMismatch"),
          }}
          render={({ field: { onChange, onBlur, value } }) => (
            <Input
              label={t("register.confirmPassword")}
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
        {registerMutation.isError && (
          <Text style={styles.errorText}>
            {registerMutation.error?.message ?? t("register.error")}
          </Text>
        )}

        {/* ── Submit ─────────────────────────────────── */}
        <Button
          title={t("register.createAccount")}
          loading={registerMutation.isPending}
          onPress={handleSubmit(onSubmit)}
          style={{ marginTop: 8 }}
        />

        {/* ── Divider ────────────────────────────────── */}
        <View style={styles.divider}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerText}>{t("register.orContinueWith")}</Text>
          <View style={styles.dividerLine} />
        </View>

        {/* ── Google Sign Up ─────────────────────────── */}
        <Button
          title={t("register.googleButton")}
          variant="outline"
          loading={googleLoading}
          onPress={signInWithGoogle}
        />

        {googleError && (
          <Text style={styles.errorText}>
            {googleAuthError?.message ?? t("register.googleError")}
          </Text>
        )}

        {/* ── Login Link ─────────────────────────────── */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            {t("register.hasAccount")}{" "}
          </Text>
          <Text
            style={styles.footerLink}
            onPress={() => router.replace("/login")}
          >
            {t("register.signIn")}
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
  errorText: {
    marginBottom: 16,
    textAlign: "center",
    fontSize: 14,
    color: colors.error,
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

import React, { useState, useRef, useMemo } from "react";
import { View, Text, KeyboardAvoidingView, Platform, ScrollView, StyleSheet } from "react-native";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import { useLogin } from "../hooks/useAuth";
import { useGoogleAuth } from "../hooks/useGoogleAuth";
import { Button, Input } from "../../../shared/components";
import { ConfirmDialog } from "@/shared/components/ui";
import { colors } from "../../../core/theme";
import { logger } from "../../../core/config/logger";
import { AUTH_ERROR_CODES } from "../api/auth-error-codes";
import { setRestoreIntent } from "../restore-intent";
import type { LoginRequest } from "../types";

export function LoginScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const loginMutation = useLogin();
  const { signInWithGoogle, isLoading: googleLoading, isError: googleError, error: googleAuthError } = useGoogleAuth();

  const [showDeactivatedDialog, setShowDeactivatedDialog] = useState(false);
  const pendingCredentials = useRef<LoginRequest | null>(null);

  const schema = useMemo(
    () =>
      z.object({
        email: z
          .string()
          .min(1, t("validation.emailRequired"))
          .email(t("validation.emailInvalid")),
        password: z.string().min(1, t("validation.passwordRequired")),
      }),
    [t],
  );

  const {
    control,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm<LoginRequest>({
    resolver: zodResolver(schema),
    defaultValues: { email: "", password: "" },
    mode: "onChange",
  });

  const onSubmit = (data: LoginRequest) => {
    logger.log("AUTH", "Login button pressed");
    loginMutation.mutate(data, {
      onError: (error) => {
        if (error.code === AUTH_ERROR_CODES.ACCOUNT_DEACTIVATED) {
          pendingCredentials.current = data;
          setShowDeactivatedDialog(true);
        } else if (error.code === AUTH_ERROR_CODES.EMAIL_NOT_VERIFIED) {
          router.push({ pathname: "/verify-email", params: { email: data.email } });
        }
      },
    });
  };

  const isDeactivatedError =
    loginMutation.isError &&
    loginMutation.error?.code === AUTH_ERROR_CODES.ACCOUNT_DEACTIVATED;

  const isUnverifiedError =
    loginMutation.isError &&
    loginMutation.error?.code === AUTH_ERROR_CODES.EMAIL_NOT_VERIFIED;

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

        {/* ── Error Message ───────────────────────────────────── */}
        {loginMutation.isError && !isDeactivatedError && (
          <Text style={styles.errorText}>
            {isUnverifiedError
              ? t("login.notVerifiedMessage")
              : (loginMutation.error?.message ?? t("login.error"))}
          </Text>
        )}

        {/* ── Submit ─────────────────────────────────── */}
        <Button
          title={t("login.signIn")}
          loading={loginMutation.isPending}
          disabled={!isValid || loginMutation.isPending}
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

      {/* ── Deactivated Account Dialog ─────────────── */}
      <ConfirmDialog
        open={showDeactivatedDialog}
        onOpenChange={(open) => {
          if (!open) {
            pendingCredentials.current = null;
            loginMutation.reset();
          }
          setShowDeactivatedDialog(open);
        }}
        title={t("login.deactivatedTitle")}
        description={t("login.deactivatedMessage")}
        confirmLabel={t("login.deactivatedConfirm")}
        cancelLabel={t("account.actions.cancel")}
        onConfirm={() => {
          if (pendingCredentials.current) {
            setRestoreIntent(pendingCredentials.current);
          }
          pendingCredentials.current = null;
          setShowDeactivatedDialog(false);
          router.push("/restore");
        }}
      />
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

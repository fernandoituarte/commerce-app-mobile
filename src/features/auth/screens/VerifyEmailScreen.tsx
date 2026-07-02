import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  View,
  Text,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useVerifyEmail, useResendVerification } from "../hooks/useAuth";
import { Button, Input } from "../../../shared/components";
import { useTheme, spacing, typography, radius } from "../../../core/theme";

const COOLDOWN_SECONDS = 60;

type VerifyForm = { code: string };

export function VerifyEmailScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const theme = useTheme();
  const { email = "" } = useLocalSearchParams<{ email: string }>();

  const verifyMutation = useVerifyEmail();
  const resendMutation = useResendVerification();

  const [resendSuccess, setResendSuccess] = useState(false);
  const [cooldown, setCooldown] = useState(COOLDOWN_SECONDS);

  // Countdown timer — starts immediately (code was just sent by register).
  useEffect(() => {
    if (cooldown <= 0) return;
    const id = setInterval(() => setCooldown((s) => s - 1), 1000);
    return () => clearInterval(id);
  }, [cooldown]);

  const schema = useMemo(
    () =>
      z.object({
        code: z
          .string()
          .min(1, t("verifyEmail.invalidCode"))
          .regex(/^\d{6}$/, t("verifyEmail.invalidCode")),
      }),
    [t],
  );

  const {
    control,
    handleSubmit,
    setError,
    clearErrors,
    formState: { errors, isValid },
  } = useForm<VerifyForm>({
    resolver: zodResolver(schema),
    defaultValues: { code: "" },
    mode: "onChange",
  });

  const onSubmit = ({ code }: VerifyForm) => {
    verifyMutation.mutate(
      { email, code: code.trim() },
      {
        onSuccess: () => {
          Alert.alert(
            t("verifyEmail.successTitle"),
            t("verifyEmail.successMessage"),
            [{ text: t("common.ok"), onPress: () => router.replace("/(auth)/login") }],
          );
        },
        onError: (err) => {
          const message =
            err.statusCode === 429
              ? t("verifyEmail.rateLimitError")
              : err.message || t("verifyEmail.error");
          setError("code", { type: "server", message });
        },
      },
    );
  };

  const handleResend = useCallback(() => {
    setResendSuccess(false);
    resendMutation.mutate(
      { email },
      {
        onSuccess: () => {
          setResendSuccess(true);
          setCooldown(COOLDOWN_SECONDS);
        },
        onError: (err) => {
          const msg =
            err.statusCode === 429
              ? t("verifyEmail.rateLimitError")
              : err.message || t("verifyEmail.error");
          Alert.alert(msg);
        },
      },
    );
  }, [email, resendMutation, t]);

  const canResend = cooldown <= 0 && !resendMutation.isPending;

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: theme.bg }]}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        {/* ── Header ─────────────────────────────────── */}
        <View style={styles.header}>
          <Text style={[typography.h1, { color: theme.text }]}>
            {t("verifyEmail.title")}
          </Text>
          <Text style={[typography.body, styles.subtitle, { color: theme.textMuted }]}>
            {t("verifyEmail.subtitle", { email })}
          </Text>
        </View>

        {/* ── Code input ─────────────────────────────── */}
        <Controller
          control={control}
          name="code"
          render={({ field: { onChange, onBlur, value } }) => (
            <Input
              label={t("verifyEmail.codeLabel")}
              value={value}
              onChangeText={(text) => {
                onChange(text);
                if (errors.code?.type === "server") clearErrors("code");
              }}
              onBlur={onBlur}
              placeholder={t("verifyEmail.codePlaceholder")}
              keyboardType="number-pad"
              maxLength={6}
              autoComplete="one-time-code"
              autoFocus
              error={errors.code?.message}
              style={styles.codeInput}
            />
          )}
        />

        {/* ── Verify button ──────────────────────────── */}
        <Button
          title={t("verifyEmail.verify")}
          loading={verifyMutation.isPending}
          disabled={!isValid || verifyMutation.isPending}
          onPress={handleSubmit(onSubmit)}
        />

        {/* ── Resend section ─────────────────────────── */}
        <View style={[styles.resendCard, { backgroundColor: theme.surfaceAlt, borderColor: theme.border }]}>
          {resendSuccess && (
            <Text style={[typography.bodySm, styles.resendSuccess, { color: theme.success }]}>
              {t("verifyEmail.resendSuccess")}
            </Text>
          )}

          <Button
            title={
              cooldown > 0
                ? t("verifyEmail.resendIn", { seconds: cooldown })
                : t("verifyEmail.resend")
            }
            variant="outline"
            disabled={!canResend}
            loading={resendMutation.isPending}
            onPress={handleResend}
          />
        </View>

        {/* ── Back to login ──────────────────────────── */}
        <Text
          style={[typography.bodySm, styles.backLink, { color: theme.primary }]}
          onPress={() => router.replace("/login")}
        >
          {t("verifyEmail.backToSignIn")}
        </Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: "center",
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing["2xl"],
  },
  header: {
    marginBottom: spacing["2xl"],
  },
  subtitle: {
    marginTop: spacing.sm,
  },
  codeInput: {
    textAlign: "center",
    fontSize: 28,
    letterSpacing: 8,
    fontWeight: "600",
  },
  resendCard: {
    marginTop: spacing.lg,
    borderRadius: radius.md,
    borderWidth: StyleSheet.hairlineWidth,
    padding: spacing.md,
    gap: spacing.sm,
  },
  resendSuccess: {
    textAlign: "center",
  },
  backLink: {
    marginTop: spacing.lg,
    textAlign: "center",
    fontWeight: "600",
  },
});

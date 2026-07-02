import React, { useMemo } from "react";
import { View, Text, KeyboardAvoidingView, Platform, ScrollView, StyleSheet } from "react-native";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
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

  const schema = useMemo(
    () =>
      z.object({
        email: z
          .string()
          .min(1, t("validation.emailRequired"))
          .email(t("validation.emailInvalid")),
      }),
    [t],
  );

  const {
    control,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm<ForgotPasswordRequest>({
    resolver: zodResolver(schema),
    defaultValues: { email: "" },
    mode: "onChange",
  });

  const onSubmit = (data: ForgotPasswordRequest) => {
    forgotMutation.mutate(data, {
      onSuccess: () => {
        router.push({ pathname: "/reset-password", params: { email: data.email } });
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
          <Text style={styles.title}>{t("forgotPassword.title")}</Text>
          <Text style={styles.subtitle}>
            {t("forgotPassword.subtitle")}
          </Text>
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

        {/* ── Error Message ──────────────────────────── */}
        {forgotMutation.isError && (
          <Text style={styles.errorText}>
            {forgotMutation.error?.message ?? t("forgotPassword.error")}
          </Text>
        )}

        {/* ── Submit ─────────────────────────────────── */}
        <Button
          title={t("forgotPassword.sendLink")}
          loading={forgotMutation.isPending}
          disabled={!isValid || forgotMutation.isPending}
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

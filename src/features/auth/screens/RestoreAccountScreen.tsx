import React, { useRef } from "react";
import {
  View,
  Text,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
} from "react-native";
import { useForm, Controller } from "react-hook-form";
import { useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import { useRestoreAccount } from "../hooks/useAuth";
import { Button, Input } from "../../../shared/components";
import { colors } from "../../../core/theme";
import { consumeRestoreIntent } from "../restore-intent";
import type { RestoreAccountRequest } from "../types";

export function RestoreAccountScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const restoreMutation = useRestoreAccount();

  // useRef so the intent is consumed exactly once, even in React Strict Mode.
  const intent = useRef(consumeRestoreIntent()).current;

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<RestoreAccountRequest>({
    defaultValues: { email: intent?.email ?? "", password: intent?.password ?? "" },
  });

  const onSubmit = (data: RestoreAccountRequest) => {
    restoreMutation.mutate(data);
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
          <Text style={styles.title}>{t("restore.title")}</Text>
          <Text style={styles.subtitle}>{t("restore.subtitle")}</Text>
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
              autoCapitalize="none"
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

        {/* ── Error Message ──────────────────────────── */}
        {restoreMutation.isError && (
          <Text style={styles.errorText}>
            {(restoreMutation.error as { message?: string })?.message ??
              t("restore.error")}
          </Text>
        )}

        {/* ── Submit ─────────────────────────────────── */}
        <Button
          title={t("restore.action")}
          loading={restoreMutation.isPending}
          onPress={handleSubmit(onSubmit)}
        />

        {/* ── Back to Login ──────────────────────────── */}
        <Text style={styles.backLink} onPress={() => router.back()}>
          {t("restore.backToSignIn")}
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

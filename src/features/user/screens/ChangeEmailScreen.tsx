import React from "react";
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, Alert } from "react-native";
import { useForm, Controller } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { useChangeEmail } from "../hooks";
import { Button, Input } from "../../../shared/components";
import { colors } from "../../../core/theme";
import type { ChangeEmailRequest } from "../types";

export function ChangeEmailScreen() {
  const { t } = useTranslation();
  const changeMutation = useChangeEmail();

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ChangeEmailRequest>({
    defaultValues: { newEmail: "", password: "" },
  });

  const onSubmit = (data: ChangeEmailRequest) => {
    changeMutation.mutate(data, {
      onSuccess: () => {
        Alert.alert(t("common.success"), t("user.changeEmail.success"));
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
        <Text style={styles.title}>{t("user.changeEmail.title")}</Text>
        <Text style={styles.subtitle}>{t("user.changeEmail.subtitle")}</Text>

        <Controller
          control={control}
          name="newEmail"
          rules={{
            required: t("user.changeEmail.emailRequired"),
            pattern: {
              value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
              message: t("user.changeEmail.emailInvalid"),
            },
          }}
          render={({ field: { onChange, onBlur, value } }) => (
            <Input
              label={t("user.changeEmail.emailLabel")}
              placeholder="new@example.com"
              keyboardType="email-address"
              autoComplete="email"
              onBlur={onBlur}
              onChangeText={onChange}
              value={value}
              error={errors.newEmail?.message}
            />
          )}
        />

        <Controller
          control={control}
          name="password"
          rules={{ required: t("user.changeEmail.passwordRequired") }}
          render={({ field: { onChange, onBlur, value } }) => (
            <Input
              label={t("user.changeEmail.passwordLabel")}
              placeholder="••••••••"
              isPassword
              onBlur={onBlur}
              onChangeText={onChange}
              value={value}
              error={errors.password?.message}
            />
          )}
        />

        {changeMutation.isError && (
          <Text style={styles.errorText}>
            {(changeMutation.error as { message?: string })?.message ??
              t("user.changeEmail.error")}
          </Text>
        )}

        <Button
          title={t("user.changeEmail.submit")}
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

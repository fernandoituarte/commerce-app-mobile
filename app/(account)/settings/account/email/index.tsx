import React, { useMemo } from "react";
import { View, Text, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Button,
  Input,
  ScreenContainer,
  ScreenHeader,
  SettingsGroup,
  SettingsRow,
} from "@/shared/components/ui";
import { radius, spacing, typography, useTheme } from "@/core/theme";
import { useChangeEmail, useUserProfile } from "@/features/user/hooks/useUser";

type EmailForm = {
  newEmail: string;
  password: string;
};

export default function EmailScreen() {
  const { t } = useTranslation();
  const theme = useTheme();
  const router = useRouter();
  const { data } = useUserProfile();
  const changeEmail = useChangeEmail();

  const schema = useMemo(
    () =>
      z.object({
        newEmail: z
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
    setError,
    clearErrors,
    formState: { errors, isValid },
  } = useForm<EmailForm>({
    resolver: zodResolver(schema),
    defaultValues: { newEmail: "", password: "" },
    mode: "onChange",
  });

  const onSubmit = ({ newEmail, password }: EmailForm) => {
    changeEmail.mutate(
      { newEmail: newEmail.trim(), password },
      {
        onSuccess: () => {
          router.push("/(account)/settings/account/email/confirm");
        },
        onError: (err) => {
          const message = err.message || t("account.email.error");
          if (err.statusCode === 401) {
            setError("password", { type: "server", message });
          } else {
            setError("newEmail", { type: "server", message });
          }
        },
      },
    );
  };

  return (
    <ScreenContainer scroll keyboard>
      <ScreenHeader title={t("account.email.title")} />

      <Text
        style={[
          typography.body,
          { color: theme.textMuted, marginBottom: spacing.md },
        ]}
      >
        {t("account.email.description")}
      </Text>

      <SettingsGroup title={t("account.email.currentLabel")}>
        <SettingsRow
          icon="mail-outline"
          label={data?.user?.email || t("account.email.noEmail")}
          chevron={false}
        />
      </SettingsGroup>

      <View
        style={[
          styles.card,
          { backgroundColor: theme.surfaceAlt, borderColor: theme.border },
        ]}
      >
        <Controller
          control={control}
          name="newEmail"
          render={({ field: { onChange, onBlur, value } }) => (
            <Input
              label={t("account.email.newLabel")}
              value={value}
              onChangeText={(text) => {
                onChange(text);
                if (errors.newEmail?.type === "server") clearErrors("newEmail");
              }}
              onBlur={onBlur}
              placeholder={t("account.email.newPlaceholder")}
              keyboardType="email-address"
              autoCapitalize="none"
              error={errors.newEmail?.message}
            />
          )}
        />
        <Controller
          control={control}
          name="password"
          render={({ field: { onChange, onBlur, value } }) => (
            <Input
              label={t("account.email.passwordLabel")}
              value={value}
              onChangeText={(text) => {
                onChange(text);
                if (errors.password?.type === "server") clearErrors("password");
              }}
              onBlur={onBlur}
              isPassword
              placeholder={t("account.email.passwordPlaceholder")}
              error={errors.password?.message}
            />
          )}
        />
        <Button
          title={t("account.email.action")}
          loading={changeEmail.isPending}
          disabled={!isValid || changeEmail.isPending}
          onPress={handleSubmit(onSubmit)}
        />
      </View>

      <Text
        style={[
          typography.bodySm,
          { color: theme.textMuted, marginTop: spacing.md },
        ]}
      >
        {t("account.email.helper")}
      </Text>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: radius.lg,
    borderWidth: StyleSheet.hairlineWidth,
    padding: spacing.md,
  },
});

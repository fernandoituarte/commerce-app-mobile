import React, { useMemo } from "react";
import { Alert, View, Text, StyleSheet } from "react-native";
import { useTranslation } from "react-i18next";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Button,
  Input,
  ScreenContainer,
  ScreenHeader,
} from "@/shared/components/ui";
import { radius, spacing, typography, useTheme } from "@/core/theme";
import { useChangePassword } from "@/features/user/hooks/useUser";

type PasswordForm = {
  oldPassword: string;
  newPassword: string;
  confirmPassword: string;
};

export default function PasswordScreen() {
  const { t } = useTranslation();
  const theme = useTheme();
  const changePassword = useChangePassword();

  const schema = useMemo(
    () =>
      z
        .object({
          oldPassword: z.string().min(1, t("account.password.currentRequired")),
          newPassword: z
            .string()
            .min(1, t("account.password.newRequired"))
            .regex(
              /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^a-zA-Z\d]).{8,}$/,
              t("validation.passwordStrong"),
            ),
          confirmPassword: z.string().min(1, t("validation.confirmPasswordRequired")),
        })
        .refine((v) => v.newPassword === v.confirmPassword, {
          message: t("account.password.mismatch"),
          path: ["confirmPassword"],
        }),
    [t],
  );

  const {
    control,
    handleSubmit,
    reset,
    setError,
    formState: { errors, isValid },
  } = useForm<PasswordForm>({
    resolver: zodResolver(schema),
    defaultValues: { oldPassword: "", newPassword: "", confirmPassword: "" },
    mode: "onChange",
  });

  const onSubmit = ({ oldPassword, newPassword }: PasswordForm) => {
    changePassword.mutate(
      { oldPassword, newPassword },
      {
        onSuccess: () => {
          Alert.alert(t("account.password.success"));
          reset();
        },
        onError: (err) => {
          const message = err.message || t("account.password.error");
          setError("oldPassword", { type: "server", message });
        },
      },
    );
  };

  return (
    <ScreenContainer scroll keyboard>
      <ScreenHeader title={t("account.password.title")} />

      <Text
        style={[
          typography.body,
          { color: theme.textMuted, marginBottom: spacing.md },
        ]}
      >
        {t("account.password.description")}
      </Text>

      <View
        style={[
          styles.card,
          { backgroundColor: theme.surfaceAlt, borderColor: theme.border },
        ]}
      >
        <Controller
          control={control}
          name="oldPassword"
          render={({ field: { onChange, onBlur, value } }) => (
            <Input
              label={t("account.password.current")}
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              isPassword
              placeholder="••••••••"
              error={errors.oldPassword?.message}
            />
          )}
        />
        <Controller
          control={control}
          name="newPassword"
          render={({ field: { onChange, onBlur, value } }) => (
            <Input
              label={t("account.password.new")}
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              isPassword
              placeholder="••••••••"
              error={errors.newPassword?.message}
            />
          )}
        />
        <Controller
          control={control}
          name="confirmPassword"
          render={({ field: { onChange, onBlur, value } }) => (
            <Input
              label={t("account.password.confirm")}
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              isPassword
              placeholder="••••••••"
              error={errors.confirmPassword?.message}
            />
          )}
        />
        <Button
          title={t("account.password.action")}
          loading={changePassword.isPending}
          disabled={!isValid || changePassword.isPending}
          onPress={handleSubmit(onSubmit)}
        />
      </View>

      <View style={styles.tips}>
        {[
          t("account.password.tip1"),
          t("account.password.tip2"),
          t("account.password.tip3"),
        ].map((tip, i) => (
          <View key={i} style={styles.tipRow}>
            <View style={[styles.bullet, { backgroundColor: theme.primary }]} />
            <Text style={[typography.bodySm, { color: theme.textMuted, flex: 1 }]}>
              {tip}
            </Text>
          </View>
        ))}
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: radius.lg,
    borderWidth: StyleSheet.hairlineWidth,
    padding: spacing.md,
  },
  tips: {
    marginTop: spacing.lg,
    gap: spacing.sm,
  },
  tipRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  bullet: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
});

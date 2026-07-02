import React, { useMemo, useState } from "react";
import { Alert, View, Text, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Button,
  ConfirmDialog,
  DangerZone,
  Input,
  ScreenContainer,
  ScreenHeader,
} from "@/shared/components/ui";
import { radius, spacing, typography, useTheme } from "@/core/theme";
import { useDeleteAccount } from "@/features/user/hooks/useUser";

type DeleteForm = { confirmText: string; password: string };

export default function DeleteScreen() {
  const { t } = useTranslation();
  const theme = useTheme();
  const [open, setOpen] = useState(false);
  const deleteAccount = useDeleteAccount();

  const schema = useMemo(
    () =>
      z.object({
        confirmText: z.string().refine((val) => val === "DELETE", {
          message: t("account.delete.mismatch"),
        }),
        password: z.string().min(1, t("validation.passwordRequired")),
      }),
    [t],
  );

  const {
    control,
    handleSubmit,
    getValues,
    formState: { isValid, errors },
  } = useForm<DeleteForm>({
    resolver: zodResolver(schema),
    defaultValues: { confirmText: "", password: "" },
    mode: "onChange",
  });

  return (
    <ScreenContainer scroll keyboard>
      <ScreenHeader title={t("account.delete.title")} />

      <View
        style={[
          styles.warning,
          { borderColor: theme.danger, backgroundColor: theme.dangerSoft },
        ]}
      >
        <Ionicons name="alert-circle" size={28} color={theme.danger} />
        <Text
          style={[
            typography.h3,
            { color: theme.danger, marginTop: spacing.sm },
          ]}
        >
          {t("account.delete.heading")}
        </Text>
        <Text
          style={[
            typography.body,
            { color: theme.text, marginTop: 4 },
          ]}
        >
          {t("account.delete.description")}
        </Text>
      </View>

      <Text
        style={[
          typography.bodySm,
          { color: theme.textMuted, marginTop: spacing.lg, marginBottom: spacing.sm },
        ]}
      >
        {t("account.delete.confirmHelper", { word: "DELETE" })}
      </Text>

      <Controller
        control={control}
        name="confirmText"
        render={({ field: { onChange, onBlur, value } }) => (
          <Input
            value={value}
            onChangeText={onChange}
            onBlur={onBlur}
            placeholder="DELETE"
            autoCapitalize="characters"
            autoCorrect={false}
            error={errors.confirmText?.message}
          />
        )}
      />

      <View style={{ marginTop: spacing.md }}>
        <Controller
          control={control}
          name="password"
          render={({ field: { onChange, onBlur, value } }) => (
            <Input
              label={t("common.password")}
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              isPassword
              placeholder="••••••••"
              error={errors.password?.message}
            />
          )}
        />
      </View>

      <DangerZone
        title={t("account.delete.dangerTitle")}
        description={t("account.delete.dangerDescription")}
      >
        <Button
          title={t("account.delete.action")}
          variant="primary"
          style={{ backgroundColor: theme.danger }}
          disabled={!isValid}
          loading={deleteAccount.isPending}
          onPress={handleSubmit(() => setOpen(true))}
        />
      </DangerZone>

      <ConfirmDialog
        open={open}
        onOpenChange={setOpen}
        title={t("account.delete.confirmTitle")}
        description={t("account.delete.confirmDescription")}
        confirmLabel={t("account.delete.action")}
        cancelLabel={t("account.actions.cancel")}
        destructive
        onConfirm={() => {
          const { confirmText, password } = getValues();
          setOpen(false);
          deleteAccount.mutate(
            { password, confirmation: confirmText },
            { onError: () => Alert.alert(t("account.delete.error")) },
          );
        }}
      />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  warning: {
    padding: spacing.lg,
    borderRadius: radius.lg,
    borderWidth: 1,
  },
});

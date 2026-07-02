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
import { useDeactivateAccount } from "@/features/user/hooks/useUser";

type DeactivateForm = { word: string };

export default function DeactivateScreen() {
  const { t } = useTranslation();
  const theme = useTheme();
  const [open, setOpen] = useState(false);
  const deactivate = useDeactivateAccount();

  const schema = useMemo(
    () =>
      z.object({
        word: z.string().refine((val) => val === "deactivate", {
          message: t("account.deactivate.confirmError"),
        }),
      }),
    [t],
  );

  const {
    control,
    handleSubmit,
    formState: { isValid, errors },
  } = useForm<DeactivateForm>({
    resolver: zodResolver(schema),
    defaultValues: { word: "" },
    mode: "onChange",
  });

  const bullets = [0, 1, 2].map((i) => t(`account.deactivate.bullets.${i}`));

  return (
    <ScreenContainer scroll keyboard>
      <ScreenHeader title={t("account.deactivate.title")} />

      <View
        style={[
          styles.intro,
          { backgroundColor: theme.surfaceAlt, borderColor: theme.border },
        ]}
      >
        <Ionicons
          name="pause-circle-outline"
          size={32}
          color={theme.warning}
        />
        <Text
          style={[
            typography.h3,
            { color: theme.text, marginTop: spacing.sm },
          ]}
        >
          {t("account.deactivate.heading")}
        </Text>
        <Text
          style={[
            typography.body,
            { color: theme.textMuted, marginTop: 4 },
          ]}
        >
          {t("account.deactivate.description")}
        </Text>
      </View>

      <View style={styles.bulletList}>
        {bullets.map((b, i) => (
          <View key={i} style={styles.bulletRow}>
            <Ionicons
              name="checkmark-circle"
              size={18}
              color={theme.success}
            />
            <Text
              style={[
                typography.body,
                { color: theme.text, flex: 1 },
              ]}
            >
              {b}
            </Text>
          </View>
        ))}
      </View>

      <Text
        style={[
          typography.bodySm,
          {
            color: theme.textMuted,
            marginBottom: spacing.sm,
            marginTop: spacing.sm,
          },
        ]}
      >
        {t("account.deactivate.confirmHint")}
      </Text>

      <Controller
        control={control}
        name="word"
        render={({ field: { onChange, onBlur, value } }) => (
          <Input
            label={t("account.deactivate.confirmLabel")}
            value={value}
            onChangeText={onChange}
            onBlur={onBlur}
            placeholder="deactivate"
            autoCapitalize="none"
            autoCorrect={false}
            error={errors.word?.message}
          />
        )}
      />

      <DangerZone
        title={t("account.deactivate.dangerTitle")}
        description={t("account.deactivate.dangerDescription")}
      >
        <Button
          title={t("account.deactivate.action")}
          variant="primary"
          style={{ backgroundColor: theme.danger }}
          disabled={!isValid}
          loading={deactivate.isPending}
          onPress={handleSubmit(() => setOpen(true))}
        />
      </DangerZone>

      <ConfirmDialog
        open={open}
        onOpenChange={setOpen}
        title={t("account.deactivate.confirmTitle")}
        description={t("account.deactivate.confirmDescription")}
        confirmLabel={t("account.deactivate.action")}
        cancelLabel={t("account.actions.cancel")}
        destructive
        onConfirm={() => {
          setOpen(false);
          deactivate.mutate(undefined, {
            onError: () => Alert.alert(t("account.deactivate.error")),
          });
        }}
      />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  intro: {
    padding: spacing.lg,
    borderRadius: radius.lg,
    borderWidth: StyleSheet.hairlineWidth,
    marginBottom: spacing.lg,
  },
  bulletList: {
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  bulletRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
});

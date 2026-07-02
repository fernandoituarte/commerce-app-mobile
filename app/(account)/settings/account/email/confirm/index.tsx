import React, { useState } from "react";
import { Alert, View, Text, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import {
  Button,
  Input,
  ScreenContainer,
  ScreenHeader,
} from "@/shared/components/ui";
import { radius, spacing, typography, useTheme } from "@/core/theme";
import { useConfirmEmailChange } from "@/features/user/hooks/useUser";

export default function EmailConfirmScreen() {
  const { t } = useTranslation();
  const theme = useTheme();
  const router = useRouter();
  const confirmEmailChange = useConfirmEmailChange();

  const [code, setCode] = useState("");
  const [codeError, setCodeError] = useState<string | null>(null);

  const isValidCode = /^\d{6}$/.test(code.trim());

  const handleConfirm = () => {
    if (!isValidCode) {
      setCodeError(t("account.email.codeInvalid"));
      return;
    }
    setCodeError(null);
    confirmEmailChange.mutate(
      { code: code.trim() },
      {
        onSuccess: () => {
          Alert.alert(t("account.email.confirmSuccess"));
          router.dismiss(2);
        },
        onError: (err) => {
          setCodeError(err.message || t("account.email.error"));
        },
      },
    );
  };

  return (
    <ScreenContainer scroll keyboard>
      <ScreenHeader title={t("account.email.confirmTitle")} />

      <Text
        style={[
          typography.body,
          { color: theme.textMuted, marginBottom: spacing.lg },
        ]}
      >
        {t("account.email.confirmDescription")}
      </Text>

      <View
        style={[
          styles.card,
          { backgroundColor: theme.surfaceAlt, borderColor: theme.border },
        ]}
      >
        <Input
          label={t("account.email.codeLabel")}
          value={code}
          onChangeText={(text) => {
            setCode(text);
            if (codeError) setCodeError(null);
          }}
          placeholder={t("account.email.codePlaceholder")}
          keyboardType="number-pad"
          maxLength={6}
          autoComplete="one-time-code"
          autoFocus
          error={codeError ?? undefined}
          style={styles.codeInput}
        />

        <Button
          title={t("account.email.confirmAction")}
          loading={confirmEmailChange.isPending}
          onPress={handleConfirm}
        />
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
  codeInput: {
    textAlign: "center",
    fontSize: 28,
    letterSpacing: 8,
    fontWeight: "600",
  },
});

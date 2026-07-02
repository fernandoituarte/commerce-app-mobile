import React from "react";
import { View, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, Alert } from "react-native";
import { useForm, Controller } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { useDeactivateAccount, useDeleteAccount } from "../hooks";
import { Button, Input } from "../../../shared/components";
import { colors } from "../../../core/theme";
import type { DeleteAccountRequest } from "../types";

export function AccountSettingsScreen() {
  const { t } = useTranslation();
  const deactivateMutation = useDeactivateAccount();
  const deleteMutation = useDeleteAccount();

  // ─── Deactivate Form ────────────────────────────────────────────
  const {
    handleSubmit: handleDeactivateSubmit,
  } = useForm({
    defaultValues: {},
  });

  // ─── Delete Form ────────────────────────────────────────────────
  const {
    control: deleteControl,
    handleSubmit: handleDeleteSubmit,
    formState: { errors: deleteErrors },
  } = useForm<DeleteAccountRequest>({
    defaultValues: { password: "", confirmation: "" },
  });

  const onDeactivate = () => {
    Alert.alert(
      t("user.account.deactivateConfirmTitle"),
      t("user.account.deactivateConfirmMessage"),
      [
        { text: t("common.cancel"), style: "cancel" },
        {
          text: t("user.account.deactivateAction"),
          style: "destructive",
          onPress: () => deactivateMutation.mutate(),
        },
      ],
    );
  };

  const onDelete = (data: DeleteAccountRequest) => {
    Alert.alert(
      t("user.account.deleteConfirmTitle"),
      t("user.account.deleteConfirmMessage"),
      [
        { text: t("common.cancel"), style: "cancel" },
        {
          text: t("user.account.deleteAction"),
          style: "destructive",
          onPress: () => deleteMutation.mutate(data),
        },
      ],
    );
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
        {/* ── Deactivate Section ─────────────────────── */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t("user.account.deactivateTitle")}</Text>
          <Text style={styles.sectionDescription}>
            {t("user.account.deactivateDescription")}
          </Text>

          {deactivateMutation.isError && (
            <Text style={styles.errorText}>
              {(deactivateMutation.error as { message?: string })?.message ??
                t("user.account.deactivateError")}
            </Text>
          )}

          <Button
            title={t("user.account.deactivateAction")}
            variant="outline"
            loading={deactivateMutation.isPending}
            onPress={handleDeactivateSubmit(onDeactivate)}
          />
        </View>

        {/* ── Delete Section ──────────────────────────── */}
        <View style={[styles.section, styles.dangerSection]}>
          <Text style={styles.dangerTitle}>{t("user.account.deleteTitle")}</Text>
          <Text style={styles.sectionDescription}>
            {t("user.account.deleteDescription")}
          </Text>

          <Controller
            control={deleteControl}
            name="password"
            rules={{ required: t("user.account.passwordRequired") }}
            render={({ field: { onChange, onBlur, value } }) => (
              <Input
                label={t("user.account.passwordLabel")}
                placeholder="••••••••"
                isPassword
                onBlur={onBlur}
                onChangeText={onChange}
                value={value}
                error={deleteErrors.password?.message}
              />
            )}
          />

          <Controller
            control={deleteControl}
            name="confirmation"
            rules={{
              required: t("user.account.confirmationRequired"),
              validate: (value) =>
                value === "DELETE" || t("user.account.confirmationInvalid"),
            }}
            render={({ field: { onChange, onBlur, value } }) => (
              <Input
                label={t("user.account.confirmationLabel")}
                placeholder='DELETE'
                onBlur={onBlur}
                onChangeText={onChange}
                value={value}
                error={deleteErrors.confirmation?.message}
              />
            )}
          />

          {deleteMutation.isError && (
            <Text style={styles.errorText}>
              {(deleteMutation.error as { message?: string })?.message ??
                t("user.account.deleteError")}
            </Text>
          )}

          <Button
            title={t("user.account.deleteAction")}
            variant="primary"
            loading={deleteMutation.isPending}
            onPress={handleDeleteSubmit(onDelete)}
            style={styles.dangerButton}
          />
        </View>
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
    paddingVertical: 32,
  },
  section: {
    marginBottom: 40,
    paddingBottom: 32,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: colors.text.light,
    marginBottom: 8,
  },
  sectionDescription: {
    fontSize: 14,
    color: "#64748b",
    marginBottom: 24,
  },
  dangerSection: {
    borderBottomWidth: 0,
  },
  dangerTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: colors.error,
    marginBottom: 8,
  },
  dangerButton: {
    backgroundColor: colors.error,
  },
  errorText: {
    marginBottom: 16,
    textAlign: "center",
    fontSize: 14,
    color: colors.error,
  },
});

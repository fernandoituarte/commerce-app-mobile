import React, { useState } from "react";
import { View, TextInput, Text, Pressable, StyleSheet } from "react-native";
import { useTranslation } from "react-i18next";
import { radius, spacing, typography, useTheme } from "@/core/theme";

interface DomainAddInputProps {
  onAdd: (domain: string, onSuccess: () => void) => void;
  apiError?: string;
  isPending?: boolean;
}

export function DomainAddInput({ onAdd, apiError, isPending }: DomainAddInputProps) {
  const { t } = useTranslation();
  const theme = useTheme();
  const [value, setValue] = useState("");
  const [localError, setLocalError] = useState<string | undefined>();

  const error = localError ?? apiError;

  function handleAdd() {
    if (!value.trim()) {
      setLocalError(t("org.profile.domainRequired"));
      return;
    }
    setLocalError(undefined);
    onAdd(value.trim(), () => setValue(""));
  }

  return (
    <View style={styles.wrap}>
      <View style={styles.row}>
        <TextInput
          style={[
            styles.input,
            {
              backgroundColor: theme.surface,
              borderColor: error ? theme.danger : theme.border,
              color: theme.text,
            },
          ]}
          value={value}
          onChangeText={(v) => {
            setValue(v);
            if (localError) setLocalError(undefined);
          }}
          placeholder={t("org.profile.domainAddPlaceholder")}
          placeholderTextColor={theme.textMuted}
          autoCapitalize="none"
          autoCorrect={false}
          keyboardType="url"
          onSubmitEditing={handleAdd}
          returnKeyType="done"
        />
        <Pressable
          onPress={handleAdd}
          disabled={isPending}
          style={({ pressed }) => [
            styles.addBtn,
            { backgroundColor: theme.primary },
            (pressed || isPending) && { opacity: 0.7 },
          ]}
        >
          <Text style={[typography.button, styles.addBtnText]}>
            {t("org.profile.domainAdd")}
          </Text>
        </Pressable>
      </View>
      {error ? (
        <Text style={[typography.caption, { color: theme.danger, marginTop: spacing.xs }]}>
          {error}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { marginTop: spacing.md },
  row: { flexDirection: "row", alignItems: "center", gap: spacing.sm },
  input: {
    flex: 1,
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 2,
    fontSize: 14,
  },
  addBtn: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 2,
    borderRadius: radius.md,
    alignItems: "center",
    justifyContent: "center",
  },
  addBtnText: { color: "#fff", fontSize: 14 },
});

import React, { ComponentProps } from "react";
import { View, Text, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import {
  ScreenContainer,
  ScreenHeader,
  SettingsGroup,
  SettingsRow,
} from "@/shared/components/ui";
import { spacing, typography, useTheme } from "@/core/theme";
import { useAppDispatch, useAppSelector } from "@/core/store/hooks";
import { setThemeMode } from "@/core/store/slices/themeSlice";
import { storage } from "@/shared/utils/storage";

type Mode = "system" | "light" | "dark";

const ICONS: Record<Mode, ComponentProps<typeof Ionicons>["name"]> = {
  system: "phone-portrait-outline",
  light: "sunny-outline",
  dark: "moon-outline",
};

export default function ThemeScreen() {
  const { t } = useTranslation();
  const theme = useTheme();
  const dispatch = useAppDispatch();
  const mode = useAppSelector((s) => s.theme.mode);

  const options: Mode[] = ["system", "light", "dark"];

  function handleSelectMode(opt: Mode) {
    dispatch(setThemeMode(opt));
    storage.setThemeMode(opt);
  }

  return (
    <ScreenContainer scroll>
      <ScreenHeader title={t("account.theme.title")} />

      <Text
        style={[
          typography.body,
          { color: theme.textMuted, marginBottom: spacing.md },
        ]}
      >
        {t("account.theme.description")}
      </Text>

      <SettingsGroup>
        {options.map((opt) => (
          <SettingsRow
            key={opt}
            icon={ICONS[opt]}
            label={t(`account.theme.options.${opt}`)}
            subtitle={t(`account.theme.subtitles.${opt}`)}
            onPress={() => handleSelectMode(opt)}
            chevron={false}
            right={
              <View
                style={[
                  styles.radio,
                  {
                    borderColor: mode === opt ? theme.primary : theme.border,
                  },
                ]}
              >
                {mode === opt ? (
                  <View
                    style={[
                      styles.radioDot,
                      { backgroundColor: theme.primary },
                    ]}
                  />
                ) : null}
              </View>
            }
          />
        ))}
      </SettingsGroup>

      <View
        style={[
          styles.preview,
          { backgroundColor: theme.surfaceAlt, borderColor: theme.border },
        ]}
      >
        <Text style={[typography.caption, { color: theme.textMuted, letterSpacing: 0.5 }]}>
          {t("account.theme.preview").toUpperCase()}
        </Text>
        <Text
          style={[typography.h2, { color: theme.text, marginTop: spacing.sm }]}
        >
          {t("account.theme.previewSample")}
        </Text>
        <Text
          style={[typography.body, { color: theme.textMuted, marginTop: spacing.xs }]}
        >
          {t("account.theme.previewBody")}
        </Text>
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  radio: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
  },
  radioDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  preview: {
    marginTop: spacing.md,
    padding: spacing.lg,
    borderRadius: 16,
    borderWidth: StyleSheet.hairlineWidth,
  },
});

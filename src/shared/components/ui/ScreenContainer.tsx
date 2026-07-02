import React from "react";
import {
  View,
  ScrollView,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  type ViewStyle,
} from "react-native";
import { SafeAreaView } from "react-native";
import { layout, spacing, useTheme } from "../../../core/theme";

interface ScreenContainerProps {
  children: React.ReactNode;
  scroll?: boolean;
  padded?: boolean;
  keyboard?: boolean;
  contentStyle?: ViewStyle;
}

export function ScreenContainer({
  children,
  scroll = false,
  padded = true,
  keyboard = false,
  contentStyle,
}: ScreenContainerProps) {
  const t = useTheme();

  const inner = (
    <View
      style={[
        styles.inner,
        { maxWidth: t.isTablet ? layout.contentMaxWidth : "100%" },
        padded && styles.padded,
        contentStyle,
      ]}
    >
      {children}
    </View>
  );

  const body = scroll ? (
    <ScrollView
      style={styles.flex}
      contentContainerStyle={styles.scrollContent}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
    >
      {inner}
    </ScrollView>
  ) : (
    <View style={[styles.flex, styles.scrollContent]}>{inner}</View>
  );

  const content = keyboard ? (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      {body}
    </KeyboardAvoidingView>
  ) : (
    body
  );

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: t.bg }]}>
      {content}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  flex: { flex: 1 },
  scrollContent: {
    flexGrow: 1,
    alignItems: "center",
  },
  inner: {
    width: "100%",
    flexGrow: 1,
  },
  padded: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xl,
  },
});

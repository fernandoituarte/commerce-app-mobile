import React from "react";
import { View, TextInput, Pressable, StyleSheet, type TextInputProps } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { radius, spacing, useTheme } from "../../../core/theme";

interface SearchBarProps extends TextInputProps {
  value: string;
  onChangeText: (text: string) => void;
  onClear?: () => void;
}

export function SearchBar({ value, onChangeText, onClear, placeholder, ...rest }: SearchBarProps) {
  const t = useTheme();
  return (
    <View style={[styles.wrap, { backgroundColor: t.surface, borderColor: t.border }]}>
      <Ionicons name="search-outline" size={18} color={t.textMuted} style={styles.icon} />
      <TextInput
        style={[styles.input, { color: t.text }]}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder ?? "Search…"}
        placeholderTextColor={t.textMuted}
        returnKeyType="search"
        clearButtonMode="never"
        autoCapitalize="none"
        autoCorrect={false}
        {...rest}
      />
      {value.length > 0 && (
        <Pressable hitSlop={8} onPress={onClear ?? (() => onChangeText(""))}>
          <Ionicons name="close-circle" size={18} color={t.textMuted} />
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.md,
    height: 44,
    gap: spacing.sm,
  },
  icon: { flexShrink: 0 },
  input: { flex: 1, fontSize: 15 },
});

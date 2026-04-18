import React, { useState } from "react";
import {
  View,
  TextInput,
  Text,
  TouchableOpacity,
  StyleSheet,
  type TextInputProps,
} from "react-native";
import { colors } from "../../../core/theme";

// ─── Props ────────────────────────────────────────────────────────

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  /** Show eye-toggle for password fields */
  isPassword?: boolean;
}

// ─── Component ────────────────────────────────────────────────────

export function Input({
  label,
  error,
  isPassword = false,
  style,
  ...rest
}: InputProps) {
  const [secureEntry, setSecureEntry] = useState(isPassword);

  return (
    <View style={styles.container}>
      {label && (
        <Text style={styles.label}>{label}</Text>
      )}

      <View style={styles.inputWrapper}>
        <TextInput
          style={[
            styles.input,
            error ? styles.inputError : styles.inputDefault,
            style,
          ]}
          placeholderTextColor="#94a3b8"
          secureTextEntry={secureEntry}
          autoCapitalize="none"
          {...rest}
        />

        {isPassword && (
          <TouchableOpacity
            style={styles.eyeToggle}
            onPress={() => setSecureEntry((prev) => !prev)}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Text style={styles.eyeText}>
              {secureEntry ? "Show" : "Hide"}
            </Text>
          </TouchableOpacity>
        )}
      </View>

      {error && (
        <Text style={styles.errorText}>{error}</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
    width: "100%",
  },
  label: {
    marginBottom: 6,
    fontSize: 14,
    fontWeight: "500",
    color: "#334155",
  },
  inputWrapper: {
    position: "relative",
  },
  input: {
    width: "100%",
    borderRadius: 12,
    borderWidth: 1,
    backgroundColor: "#ffffff",
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: "#0f172a",
  },
  inputDefault: {
    borderColor: colors.border.light,
  },
  inputError: {
    borderColor: colors.error,
  },
  eyeToggle: {
    position: "absolute",
    right: 12,
    top: 14,
  },
  eyeText: {
    fontSize: 14,
    color: "#64748b",
  },
  errorText: {
    marginTop: 4,
    fontSize: 12,
    color: colors.error,
  },
});

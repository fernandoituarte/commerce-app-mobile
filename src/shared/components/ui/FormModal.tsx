import React from "react";
import {
  Modal,
  View,
  Text,
  Pressable,
  ScrollView,
  StyleSheet,
  Animated,
  useWindowDimensions,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Button } from "./Button";
import { radius, spacing, typography, useTheme } from "../../../core/theme";

interface FormModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  submitLabel?: string;
  onSubmit?: () => void;
  submitLoading?: boolean;
  children: React.ReactNode;
}

export function FormModal({ open, onClose, title, submitLabel = "Save", onSubmit, submitLoading, children }: FormModalProps) {
  const t = useTheme();
  const { width, height } = useWindowDimensions();
  const isTablet = width >= 768;

  const overlayOpacity = React.useRef(new Animated.Value(0)).current;
  const slideY = React.useRef(new Animated.Value(isTablet ? 0 : height * 0.5)).current;
  const scale = React.useRef(new Animated.Value(isTablet ? 0.94 : 1)).current;

  React.useEffect(() => {
    if (open) {
      Animated.parallel([
        Animated.timing(overlayOpacity, { toValue: 1, duration: 200, useNativeDriver: true }),
        Animated.spring(slideY, { toValue: 0, damping: 24, stiffness: 280, useNativeDriver: true }),
        Animated.spring(scale, { toValue: 1, damping: 24, stiffness: 280, useNativeDriver: true }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(overlayOpacity, { toValue: 0, duration: 160, useNativeDriver: true }),
        Animated.timing(slideY, { toValue: isTablet ? 0 : height * 0.5, duration: 160, useNativeDriver: true }),
        Animated.timing(scale, { toValue: isTablet ? 0.94 : 1, duration: 160, useNativeDriver: true }),
      ]).start();
    }
  }, [open]);

  return (
    <Modal transparent visible={open} animationType="none" onRequestClose={onClose} statusBarTranslucent>
      <Animated.View style={[styles.overlay, { opacity: overlayOpacity }]}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
      </Animated.View>

      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        pointerEvents="box-none"
      >
        <Animated.View
          style={[
            styles.sheet,
            { backgroundColor: t.surfaceAlt, maxHeight: height * 0.88 },
            isTablet
              ? [styles.sheetTablet, { transform: [{ scale }] }]
              : { transform: [{ translateY: slideY }] },
          ]}
        >
          {/* Header */}
          <View style={[styles.header, { borderBottomColor: t.border }]}>
            {!isTablet && <View style={[styles.handle, { backgroundColor: t.border }]} />}
            <View style={styles.titleRow}>
              <Text style={[typography.h3, { color: t.text, flex: 1 }]}>{title}</Text>
              <Pressable onPress={onClose} hitSlop={8} style={({ pressed }) => [styles.closeBtn, pressed && { opacity: 0.6 }]}>
                <Ionicons name="close" size={20} color={t.textMuted} />
              </Pressable>
            </View>
          </View>

          {/* Content */}
          <ScrollView
            contentContainerStyle={styles.content}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            {children}
          </ScrollView>

          {/* Footer */}
          <View style={[styles.footer, { borderTopColor: t.border }]}>
            <Button title="Cancel" variant="outline" onPress={onClose} style={styles.footerBtn} />
            <Button title={submitLabel} onPress={onSubmit ?? onClose} loading={submitLoading} style={styles.footerBtn} />
          </View>
        </Animated.View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { ...StyleSheet.absoluteFillObject, backgroundColor: "rgba(0,0,0,0.5)" },
  container: { flex: 1, justifyContent: "flex-end" },
  sheet: {
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.12,
    shadowRadius: 20,
    elevation: 20,
  },
  sheetTablet: {
    alignSelf: "center",
    width: 520,
    borderRadius: radius.xl,
    marginBottom: 60,
  },
  handle: { width: 40, height: 4, borderRadius: 2, alignSelf: "center", marginTop: 12 },
  header: { paddingHorizontal: spacing.lg, paddingTop: spacing.sm, paddingBottom: spacing.md, borderBottomWidth: StyleSheet.hairlineWidth },
  titleRow: { flexDirection: "row", alignItems: "center", marginTop: spacing.sm },
  closeBtn: { padding: spacing.xs },
  content: { paddingHorizontal: spacing.lg, paddingVertical: spacing.md },
  footer: {
    flexDirection: "row",
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    paddingBottom: spacing.xl,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  footerBtn: { flex: 1 },
});

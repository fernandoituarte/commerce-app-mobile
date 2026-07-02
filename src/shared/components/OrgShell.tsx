import React, { ReactNode, useState } from "react";
import {
  View,
  Text,
  Pressable,
  ScrollView,
  SafeAreaView,
  StyleSheet,
  Platform,
  KeyboardAvoidingView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Sidebar, SidebarContent, SidebarHeader } from "./ui/Sidebar";
import { OrgNavContent } from "./OrgNavContent";
import { spacing, typography, useTheme } from "../../core/theme";

interface OrgShellProps {
  title: string;
  children: ReactNode;
  scrollable?: boolean;
  padded?: boolean;
  keyboard?: boolean;
  headerRight?: ReactNode;
}

// ─── Component ────────────────────────────────────────────────────

export function OrgShell({
  title,
  children,
  scrollable = true,
  padded = true,
  keyboard = false,
  headerRight,
}: OrgShellProps) {
  const t = useTheme();
  const [mobileOpen, setMobileOpen] = useState(false);

  const innerContent = (
    <View style={[styles.flex, padded && styles.padded]}>{children}</View>
  );

  // ── Tablet: persistent side panel ───────────────────────────────
  if (t.isTablet) {
    return (
      <SafeAreaView style={[styles.root, { backgroundColor: t.bg }]}>
        <View style={styles.tabletRow}>
          {/* Sidebar panel */}
          <View
            style={[
              styles.tabletSidebar,
              { backgroundColor: t.surfaceAlt, borderRightColor: t.border },
            ]}
          >
            <OrgNavContent />
          </View>

          {/* Main */}
          <View style={styles.flex}>
            {/* Tablet top bar */}
            <View
              style={[
                styles.tabletTopBar,
                { backgroundColor: t.bg, borderBottomColor: t.border },
              ]}
            >
              <Text style={[typography.h2, { color: t.text, flex: 1 }]}>
                {title}
              </Text>
              {headerRight}
            </View>

            {scrollable ? (
              <ScrollView
                style={styles.flex}
                contentContainerStyle={[
                  styles.scrollContent,
                  padded && styles.padded,
                ]}
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
              >
                {children}
              </ScrollView>
            ) : keyboard ? (
              <KeyboardAvoidingView
                style={styles.flex}
                behavior={Platform.OS === "ios" ? "padding" : undefined}
              >
                {innerContent}
              </KeyboardAvoidingView>
            ) : (
              innerContent
            )}
          </View>
        </View>
      </SafeAreaView>
    );
  }

  // ── Mobile: hamburger + modal drawer ────────────────────────────
  const body = scrollable ? (
    <ScrollView
      style={styles.flex}
      contentContainerStyle={[styles.scrollContent, padded && styles.padded]}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
    >
      {children}
    </ScrollView>
  ) : keyboard ? (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      {innerContent}
    </KeyboardAvoidingView>
  ) : (
    <View style={styles.flex}>{innerContent}</View>
  );

  return (
    <SafeAreaView style={[styles.root, { backgroundColor: t.bg }]}>
      {/* Mobile top bar */}
      <View
        style={[
          styles.mobileTopBar,
          { backgroundColor: t.bg, borderBottomColor: t.border },
        ]}
      >
        <Pressable
          onPress={() => setMobileOpen(true)}
          hitSlop={10}
          accessibilityRole="button"
          accessibilityLabel="Open menu"
          style={({ pressed }) => [styles.menuBtn, pressed && { opacity: 0.5 }]}
        >
          <Ionicons name="menu" size={24} color={t.text} />
        </Pressable>
        <Text
          style={[typography.h3, { color: t.text, flex: 1 }]}
          numberOfLines={1}
        >
          {title}
        </Text>
        {headerRight}
      </View>

      {body}

      {/* Mobile sidebar modal */}
      <Sidebar open={mobileOpen} onOpenChange={setMobileOpen}>
        <SidebarHeader>
          <Pressable
            onPress={() => setMobileOpen(false)}
            hitSlop={8}
            style={({ pressed }) => [
              styles.closeBtn,
              pressed && { opacity: 0.5 },
            ]}
          >
            <Ionicons name="close" size={22} color={t.text} />
          </Pressable>
        </SidebarHeader>
        <SidebarContent>
          <OrgNavContent onNavigate={() => setMobileOpen(false)} />
        </SidebarContent>
      </Sidebar>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  flex: { flex: 1 },
  scrollContent: { flexGrow: 1 },
  padded: { padding: spacing.lg, paddingBottom: spacing.xl },

  // Tablet
  tabletRow: { flex: 1, flexDirection: "row" },
  tabletSidebar: {
    width: 264,
    borderRightWidth: StyleSheet.hairlineWidth,
  },
  tabletTopBar: {
    height: 60,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: spacing.lg,
    gap: spacing.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },

  // Mobile
  mobileTopBar: {
    height: 56,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: spacing.md,
    gap: spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  menuBtn: {
    width: 36,
    height: 36,
    alignItems: "center",
    justifyContent: "center",
  },
  closeBtn: { alignSelf: "flex-end", padding: spacing.xs },
});

import React from "react";
import {
  Modal,
  View,
  Text,
  Pressable,
  StyleSheet,
  Animated,
  useWindowDimensions,
  ScrollView,
} from "react-native";

// ─── Types ────────────────────────────────────────────────────────

interface SidebarProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: React.ReactNode;
}

interface SidebarHeaderProps {
  children: React.ReactNode;
}

interface SidebarContentProps {
  children: React.ReactNode;
}

interface SidebarFooterProps {
  children: React.ReactNode;
}

interface SidebarGroupProps {
  children: React.ReactNode;
  label?: string;
}

interface SidebarMenuItemProps {
  label: string;
  icon?: React.ReactNode;
  onPress: () => void;
  active?: boolean;
  badge?: string | number;
}

interface SidebarSeparatorProps {}

// ─── Context ──────────────────────────────────────────────────────

const SidebarContext = React.createContext<{
  onClose: () => void;
}>({ onClose: () => {} });

// ─── Root ─────────────────────────────────────────────────────────

export function Sidebar({ open, onOpenChange, children }: SidebarProps) {
  const { width } = useWindowDimensions();
  const isTablet = width >= 768;
  const sidebarWidth = isTablet ? 320 : Math.min(width * 0.82, 300);

  const overlayOpacity = React.useRef(new Animated.Value(0)).current;
  const translateX = React.useRef(new Animated.Value(-sidebarWidth)).current;

  React.useEffect(() => {
    if (open) {
      Animated.parallel([
        Animated.timing(overlayOpacity, {
          toValue: 1,
          duration: 220,
          useNativeDriver: true,
        }),
        Animated.spring(translateX, {
          toValue: 0,
          useNativeDriver: true,
          damping: 26,
          stiffness: 280,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(overlayOpacity, {
          toValue: 0,
          duration: 180,
          useNativeDriver: true,
        }),
        Animated.timing(translateX, {
          toValue: -sidebarWidth,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [open]);

  return (
    <SidebarContext.Provider value={{ onClose: () => onOpenChange(false) }}>
      <Modal
        transparent
        visible={open}
        animationType="none"
        onRequestClose={() => onOpenChange(false)}
        statusBarTranslucent
      >
        {/* Backdrop */}
        <Animated.View style={[styles.overlay, { opacity: overlayOpacity }]}>
          <Pressable style={StyleSheet.absoluteFill} onPress={() => onOpenChange(false)} />
        </Animated.View>

        {/* Sidebar panel */}
        <Animated.View
          style={[
            styles.sidebar,
            { width: sidebarWidth, transform: [{ translateX }] },
          ]}
        >
          {children}
        </Animated.View>
      </Modal>
    </SidebarContext.Provider>
  );
}

// ─── Trigger ──────────────────────────────────────────────────────

export function SidebarTrigger({
  onPress,
  children,
}: {
  onPress: () => void;
  children: React.ReactNode;
}) {
  return <Pressable onPress={onPress}>{children}</Pressable>;
}

// ─── Header ───────────────────────────────────────────────────────

export function SidebarHeader({ children }: SidebarHeaderProps) {
  return <View style={styles.header}>{children}</View>;
}

// ─── Content ──────────────────────────────────────────────────────

export function SidebarContent({ children }: SidebarContentProps) {
  return (
    <ScrollView
      style={styles.content}
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={false}
    >
      {children}
    </ScrollView>
  );
}

// ─── Footer ───────────────────────────────────────────────────────

export function SidebarFooter({ children }: SidebarFooterProps) {
  return <View style={styles.footer}>{children}</View>;
}

// ─── Group ────────────────────────────────────────────────────────

export function SidebarGroup({ children, label }: SidebarGroupProps) {
  return (
    <View style={styles.group}>
      {label && <Text style={styles.groupLabel}>{label.toUpperCase()}</Text>}
      {children}
    </View>
  );
}

// ─── Menu Item ────────────────────────────────────────────────────

export function SidebarMenuItem({
  label,
  icon,
  onPress,
  active = false,
  badge,
}: SidebarMenuItemProps) {
  const { onClose } = React.useContext(SidebarContext);

  return (
    <Pressable
      onPress={() => { onPress(); onClose(); }}
      style={({ pressed }) => [
        styles.menuItem,
        active && styles.menuItemActive,
        pressed && styles.menuItemPressed,
      ]}
    >
      {icon && (
        <View style={[styles.menuItemIcon, active && styles.menuItemIconActive]}>
          {icon}
        </View>
      )}
      <Text style={[styles.menuItemLabel, active && styles.menuItemLabelActive]}>
        {label}
      </Text>
      {badge !== undefined && (
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{badge}</Text>
        </View>
      )}
    </Pressable>
  );
}

// ─── Separator ────────────────────────────────────────────────────

export function SidebarSeparator({}: SidebarSeparatorProps) {
  return <View style={styles.separator} />;
}

// ─── Styles ───────────────────────────────────────────────────────

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0, 0, 0, 0.45)",
  },
  sidebar: {
    position: "absolute",
    top: 0,
    left: 0,
    bottom: 0,
    backgroundColor: "#ffffff",
    shadowColor: "#000",
    shadowOffset: { width: 4, height: 0 },
    shadowOpacity: 0.12,
    shadowRadius: 20,
    elevation: 20,
    flexDirection: "column",
  },

  // Header
  header: {
    paddingTop: 56,
    paddingHorizontal: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#f1f5f9",
  },

  // Content
  content: {
    flex: 1,
  },
  contentContainer: {
    paddingVertical: 12,
    paddingHorizontal: 12,
  },

  // Footer
  footer: {
    paddingHorizontal: 12,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: "#f1f5f9",
  },

  // Group
  group: {
    marginBottom: 8,
  },
  groupLabel: {
    fontSize: 11,
    fontWeight: "600",
    color: "#94a3b8",
    letterSpacing: 0.8,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },

  // Menu Item
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 11,
    borderRadius: 10,
    gap: 12,
  },
  menuItemActive: {
    backgroundColor: "#f1f5f9",
  },
  menuItemPressed: {
    backgroundColor: "#f8fafc",
  },
  menuItemIcon: {
    width: 22,
    alignItems: "center",
    justifyContent: "center",
    opacity: 0.5,
  },
  menuItemIconActive: {
    opacity: 1,
  },
  menuItemLabel: {
    flex: 1,
    fontSize: 14,
    fontWeight: "500",
    color: "#64748b",
  },
  menuItemLabelActive: {
    color: "#0f172a",
    fontWeight: "600",
  },

  // Badge
  badge: {
    backgroundColor: "#0f172a",
    borderRadius: 10,
    paddingHorizontal: 7,
    paddingVertical: 2,
    minWidth: 20,
    alignItems: "center",
  },
  badgeText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#ffffff",
  },

  // Separator
  separator: {
    height: 1,
    backgroundColor: "#f1f5f9",
    marginHorizontal: 12,
    marginVertical: 8,
  },
});

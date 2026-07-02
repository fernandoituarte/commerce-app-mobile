import React from "react";
import {
  Modal,
  View,
  Text,
  Pressable,
  StyleSheet,
  Animated,
  useWindowDimensions,
} from "react-native";

// ─── Types ────────────────────────────────────────────────────────

interface AlertDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: React.ReactNode;
}

interface AlertDialogContentProps {
  children: React.ReactNode;
}

interface AlertDialogHeaderProps {
  children: React.ReactNode;
}

interface AlertDialogFooterProps {
  children: React.ReactNode;
}

interface AlertDialogTitleProps {
  children: React.ReactNode;
}

interface AlertDialogDescriptionProps {
  children: React.ReactNode;
}

interface AlertDialogActionProps {
  onPress: () => void;
  children: React.ReactNode;
  variant?: "default" | "destructive";
}

interface AlertDialogCancelProps {
  onPress: () => void;
  children: React.ReactNode;
}

// ─── Context ──────────────────────────────────────────────────────

const AlertDialogContext = React.createContext<{
  onClose: () => void;
}>({ onClose: () => {} });

// ─── Root ─────────────────────────────────────────────────────────

export function AlertDialog({ open, onOpenChange, children }: AlertDialogProps) {
  const { width } = useWindowDimensions();
  const isTablet = width >= 768;

  const overlayOpacity = React.useRef(new Animated.Value(0)).current;
  const translateY = React.useRef(new Animated.Value(400)).current;

  React.useEffect(() => {
    if (open) {
      Animated.parallel([
        Animated.timing(overlayOpacity, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.spring(translateY, {
          toValue: 0,
          useNativeDriver: true,
          damping: 24,
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
        Animated.timing(translateY, {
          toValue: 400,
          duration: 180,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [open]);

  return (
    <AlertDialogContext.Provider value={{ onClose: () => onOpenChange(false) }}>
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

        {/* Sheet */}
        <View style={styles.sheetContainer} pointerEvents="box-none">
          <Animated.View
            style={[
              styles.sheet,
              isTablet && styles.sheetTablet,
              { transform: [{ translateY }] },
            ]}
          >
            {/* Handle bar */}
            <View style={styles.handle} />
            {children}
          </Animated.View>
        </View>
      </Modal>
    </AlertDialogContext.Provider>
  );
}

// ─── Trigger ──────────────────────────────────────────────────────

export function AlertDialogTrigger({
  onPress,
  children,
}: {
  onPress: () => void;
  children: React.ReactNode;
}) {
  return <Pressable onPress={onPress}>{children}</Pressable>;
}

// ─── Content ──────────────────────────────────────────────────────

export function AlertDialogContent({ children }: AlertDialogContentProps) {
  return <View style={styles.content}>{children}</View>;
}

// ─── Header ───────────────────────────────────────────────────────

export function AlertDialogHeader({ children }: AlertDialogHeaderProps) {
  return <View style={styles.header}>{children}</View>;
}

// ─── Footer ───────────────────────────────────────────────────────

export function AlertDialogFooter({ children }: AlertDialogFooterProps) {
  return <View style={styles.footer}>{children}</View>;
}

// ─── Title ────────────────────────────────────────────────────────

export function AlertDialogTitle({ children }: AlertDialogTitleProps) {
  return <Text style={styles.title}>{children}</Text>;
}

// ─── Description ──────────────────────────────────────────────────

export function AlertDialogDescription({ children }: AlertDialogDescriptionProps) {
  return <Text style={styles.description}>{children}</Text>;
}

// ─── Action ───────────────────────────────────────────────────────

export function AlertDialogAction({
  onPress,
  children,
  variant = "default",
}: AlertDialogActionProps) {
  const { onClose } = React.useContext(AlertDialogContext);

  return (
    <Pressable
      style={({ pressed }) => [
        styles.actionButton,
        variant === "destructive" ? styles.actionDestructive : styles.actionDefault,
        pressed && styles.buttonPressed,
      ]}
      onPress={() => { onPress(); onClose(); }}
    >
      <Text
        style={[
          styles.actionText,
          variant === "destructive" ? styles.actionTextDestructive : styles.actionTextDefault,
        ]}
      >
        {children}
      </Text>
    </Pressable>
  );
}

// ─── Cancel ───────────────────────────────────────────────────────

export function AlertDialogCancel({ onPress, children }: AlertDialogCancelProps) {
  const { onClose } = React.useContext(AlertDialogContext);

  return (
    <Pressable
      style={({ pressed }) => [styles.cancelButton, pressed && styles.buttonPressed]}
      onPress={() => { onPress(); onClose(); }}
    >
      <Text style={styles.cancelText}>{children}</Text>
    </Pressable>
  );
}

// ─── Styles ───────────────────────────────────────────────────────

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  sheetContainer: {
    flex: 1,
    justifyContent: "flex-end",
  },
  sheet: {
    backgroundColor: "#ffffff",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingBottom: 34,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 20,
  },
  // Tableta: centrado con ancho fijo y margen inferior
  sheetTablet: {
    alignSelf: "center",
    width: "50%",
    borderRadius: 24,
    marginBottom: 40,
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: "#e2e8f0",
    alignSelf: "center",
    marginTop: 12,
    marginBottom: 4,
  },
  content: {
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 8,
  },
  header: {
    marginBottom: 20,
    gap: 6,
  },
  footer: {
    paddingHorizontal: 24,
    paddingTop: 8,
    flexDirection: "column",
    gap: 10,
  },
  title: {
    fontSize: 18,
    fontWeight: "700",
    color: "#0f172a",
    lineHeight: 24,
  },
  description: {
    fontSize: 14,
    color: "#64748b",
    lineHeight: 22,
  },
  actionButton: {
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  actionDefault: {
    backgroundColor: "#0f172a",
  },
  actionDestructive: {
    backgroundColor: "#dc2626",
  },
  actionText: {
    fontSize: 15,
    fontWeight: "600",
  },
  actionTextDefault: {
    color: "#ffffff",
  },
  actionTextDestructive: {
    color: "#ffffff",
  },
  cancelButton: {
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#ffffff",
  },
  cancelText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#0f172a",
  },
  buttonPressed: {
    opacity: 0.7,
  },
});

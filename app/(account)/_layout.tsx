import { Stack } from "expo-router";
import { View, StyleSheet } from "react-native";
import { useTheme } from "@/core/theme";

export default function AccountLayout() {
  const t = useTheme();
  return (
    <View style={[styles.root, { backgroundColor: t.bg }]}>
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: t.bg },
          animation: "slide_from_right",
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
});

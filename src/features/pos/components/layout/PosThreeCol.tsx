import React from "react";
import { View, StyleSheet, useWindowDimensions } from "react-native";
import { LEFT_COL_WIDTH, CENTER_COL_WIDTH } from "../../constants/pos";
import { useTheme } from "@/core/theme";

interface PosThreeColProps {
  left: React.ReactNode;
  center: React.ReactNode;
  right: React.ReactNode;
}

export function PosThreeCol({ left, center, right }: PosThreeColProps) {
  const theme = useTheme();
  const { width } = useWindowDimensions();

  const rightWidth = Math.floor(width * 0.4);
  const remaining = width - rightWidth;
  const total = LEFT_COL_WIDTH + CENTER_COL_WIDTH;
  const leftWidth = Math.floor(remaining * (LEFT_COL_WIDTH / total));
  const centerWidth = remaining - leftWidth;

  return (
    <View style={styles.root}>
      <View
        style={[
          styles.col,
          { width: leftWidth, borderRightColor: theme.border, backgroundColor: theme.surface },
        ]}
      >
        {left}
      </View>
      <View style={[styles.col, { width: centerWidth, borderRightColor: theme.border }]}>
        {center}
      </View>
      <View style={[styles.col, { width: rightWidth }]}>{right}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, flexDirection: "row" },
  col: { borderRightWidth: StyleSheet.hairlineWidth },
});

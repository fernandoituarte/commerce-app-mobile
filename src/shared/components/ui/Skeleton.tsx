import React from "react";
import { Animated, StyleSheet, type ViewStyle } from "react-native";
import { radius, useTheme } from "../../../core/theme";

interface SkeletonProps {
  width?: number | string;
  height?: number;
  circle?: boolean;
  style?: ViewStyle;
}

export function Skeleton({ width = "100%", height = 14, circle, style }: SkeletonProps) {
  const t = useTheme();
  const opacity = React.useRef(new Animated.Value(0.4)).current;

  React.useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 0.9,
          duration: 700,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0.4,
          duration: 700,
          useNativeDriver: true,
        }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [opacity]);

  return (
    <Animated.View
      style={[
        {
          width: width as ViewStyle["width"],
          height: circle ? (typeof width === "number" ? width : height) : height,
          borderRadius: circle ? radius.pill : radius.sm,
          backgroundColor: t.surface,
          opacity,
        },
        style,
      ]}
    />
  );
}

export const SkeletonStyles = StyleSheet.create({});

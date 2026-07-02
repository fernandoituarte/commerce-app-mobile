import React from "react";
import { View, StyleSheet } from "react-native";
import Svg, { Rect, Polyline, Defs, LinearGradient, Stop, Path } from "react-native-svg";
import { radius, useTheme } from "../../../core/theme";

interface BarChartProps {
  data: number[];
  height?: number;
  color?: string;
}

export function BarChart({ data, height = 100, color }: BarChartProps) {
  const t = useTheme();
  const c = color ?? t.primary;
  const [width, setWidth] = React.useState(300);
  const maxVal = Math.max(...data, 1);
  const n = data.length;
  const gap = 6;
  const barW = (width - gap * (n + 1)) / n;

  return (
    <View
      style={styles.wrap}
      onLayout={(e) => setWidth(e.nativeEvent.layout.width)}
    >
      <Svg width={width} height={height}>
        <Defs>
          <LinearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0%" stopColor={c} stopOpacity={0.9} />
            <Stop offset="100%" stopColor={c} stopOpacity={0.4} />
          </LinearGradient>
        </Defs>
        {data.map((v, i) => {
          const barH = Math.max(4, (v / maxVal) * (height - 8));
          const x = gap + i * (barW + gap);
          const y = height - barH;
          return (
            <Rect
              key={i}
              x={x}
              y={y}
              width={barW}
              height={barH}
              rx={3}
              fill="url(#barGrad)"
            />
          );
        })}
      </Svg>
    </View>
  );
}

interface LineChartProps {
  data: number[];
  height?: number;
  color?: string;
  filled?: boolean;
}

export function LineChart({ data, height = 100, color, filled = true }: LineChartProps) {
  const t = useTheme();
  const c = color ?? t.primary;
  const [width, setWidth] = React.useState(300);
  const maxVal = Math.max(...data, 1);
  const n = data.length;

  const pts = data.map((v, i) => {
    const x = (i / (n - 1)) * width;
    const y = height - 8 - (v / maxVal) * (height - 16);
    return { x, y };
  });

  const polyPoints = pts.map((p) => `${p.x},${p.y}`).join(" ");

  const areaPath = pts.length > 0
    ? `M ${pts[0].x} ${pts[0].y} ` +
      pts.slice(1).map((p) => `L ${p.x} ${p.y}`).join(" ") +
      ` L ${pts[pts.length - 1].x} ${height} L ${pts[0].x} ${height} Z`
    : "";

  return (
    <View
      style={styles.wrap}
      onLayout={(e) => setWidth(e.nativeEvent.layout.width)}
    >
      <Svg width={width} height={height}>
        {filled && areaPath ? (
          <>
            <Defs>
              <LinearGradient id="lineAreaGrad" x1="0" y1="0" x2="0" y2="1">
                <Stop offset="0%" stopColor={c} stopOpacity={0.2} />
                <Stop offset="100%" stopColor={c} stopOpacity={0.0} />
              </LinearGradient>
            </Defs>
            <Path d={areaPath} fill="url(#lineAreaGrad)" />
          </>
        ) : null}
        <Polyline
          points={polyPoints}
          fill="none"
          stroke={c}
          strokeWidth={2.5}
          strokeLinejoin="round"
          strokeLinecap="round"
        />
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { width: "100%" },
});

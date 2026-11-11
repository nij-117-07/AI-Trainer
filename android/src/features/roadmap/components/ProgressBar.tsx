// src/features/roadmap/components/ProgressBar.tsx
/** Thin completion bar with the count in words, counting main points and subpoints together. */
import { StyleSheet, Text, View } from "react-native";
import { shape, spacing, typeScale, useThemeColors } from "@/theme";
import type { RoadmapProgress } from "../types";

export function ProgressBar({ done, total, percent }: RoadmapProgress) {
  const colors = useThemeColors();
  const label = total === 0 ? "No items yet" : `${done} of ${total} done`;
  return (
    <View
      accessible
      accessibilityRole="progressbar"
      accessibilityLabel={label}
      accessibilityValue={{ min: 0, max: 100, now: percent }}
      style={styles.wrap}
    >
      <View style={[styles.track, { backgroundColor: colors.muted }]}>
        <View style={[styles.fill, { backgroundColor: colors.tone.emerald.fg, width: `${percent}%` }]} />
      </View>
      <Text style={[styles.label, { color: colors.mutedForeground }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  track: {
    flex: 1,
    height: 6,
    borderRadius: shape.full,
    overflow: "hidden",
  },
  fill: {
    height: "100%",
  },
  label: {
    ...typeScale.caption,
  },
});

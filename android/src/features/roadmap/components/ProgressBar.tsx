// src/features/roadmap/components/ProgressBar.tsx
/** Completion bar for a roadmap, counting main points and subpoints together. */
import { StyleSheet, Text, View } from "react-native";
import { radius, spacing, useThemeColors } from "@/theme";
import type { RoadmapProgress } from "../types";

export function ProgressBar({ done, total, percent }: RoadmapProgress) {
  const colors = useThemeColors();
  const label = total === 0 ? "No items yet" : `${done} of ${total} done · ${percent}%`;
  return (
    <View style={styles.wrap}>
      <View style={[styles.track, { backgroundColor: colors.muted }]}>
        <View style={[styles.fill, { backgroundColor: colors.tone.emerald.fg, width: `${percent}%` }]} />
      </View>
      <Text style={[styles.label, { color: colors.mutedForeground }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    gap: spacing.xs,
  },
  track: {
    height: 8,
    borderRadius: radius.full,
    overflow: "hidden",
  },
  fill: {
    height: "100%",
  },
  label: {
    fontSize: 13,
  },
});

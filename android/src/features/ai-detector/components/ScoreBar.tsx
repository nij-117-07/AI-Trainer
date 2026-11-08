// src/features/ai-detector/components/ScoreBar.tsx
/** Labelled 0–100% meter used for the AI likelihood and the pass-as-human confidence. */
import { StyleSheet, Text, View } from "react-native";
import { radius, spacing, useThemeColors, type Tone } from "@/theme";

interface ScoreBarProps {
  value: number;
  label: string;
  caption?: string;
  tone: Tone;
}

export function ScoreBar({ value, label, caption, tone }: ScoreBarProps) {
  const colors = useThemeColors();
  const clamped = Math.min(1, Math.max(0, value));
  const percent = Math.round(clamped * 100);

  return (
    <View style={styles.wrap}>
      <View style={styles.row}>
        <Text style={[styles.label, { color: colors.mutedForeground }]}>{label}</Text>
        <Text style={[styles.value, { color: colors.foreground }]}>{percent}%</Text>
      </View>
      <View
        accessibilityRole="progressbar"
        accessibilityLabel={label}
        accessibilityValue={{ min: 0, max: 100, now: percent }}
        style={[styles.track, { backgroundColor: colors.muted }]}
      >
        <View style={[styles.fill, { backgroundColor: colors.tone[tone].fg, width: `${percent}%` }]} />
      </View>
      {caption ? <Text style={[styles.caption, { color: colors.mutedForeground }]}>{caption}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    gap: spacing.sm,
  },
  row: {
    flexDirection: "row",
    alignItems: "baseline",
    justifyContent: "space-between",
    gap: spacing.sm,
  },
  label: {
    fontSize: 13,
    fontWeight: "500",
  },
  value: {
    fontSize: 20,
    fontWeight: "700",
  },
  track: {
    height: 8,
    borderRadius: radius.full,
    overflow: "hidden",
  },
  fill: {
    height: "100%",
    borderRadius: radius.full,
  },
  caption: {
    fontSize: 13,
    lineHeight: 18,
  },
});

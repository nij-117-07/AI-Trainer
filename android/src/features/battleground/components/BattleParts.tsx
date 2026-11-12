// src/features/battleground/components/BattleParts.tsx
/** Small pieces shared by the battle log and the sidebar: progress bars and pills. */
import { StyleSheet, Text, View } from "react-native";
import { shape, spacing, typeScale, useThemeColors } from "@/theme";

export function ProgressTrack({ label, value, text }: { label: string; value: number; text?: string }) {
  const colors = useThemeColors();
  const width = Math.max(0, Math.min(100, value));
  return (
    <View
      accessibilityRole="progressbar"
      accessibilityLabel={label}
      accessibilityValue={{ min: 0, max: 100, now: width, text }}
      style={[styles.track, { backgroundColor: colors.muted }]}
    >
      <View style={[styles.fill, { backgroundColor: colors.primary, width: `${width}%` }]} />
    </View>
  );
}

export function HealthBar({ label, value }: { label: string; value: number }) {
  const colors = useThemeColors();
  return (
    <View style={styles.health}>
      <View style={styles.healthLabel}>
        <Text style={[styles.strong, { color: colors.foreground }]}>{label}</Text>
        <Text style={[styles.caption, { color: colors.mutedForeground }]}>{value} HP</Text>
      </View>
      <ProgressTrack label={label} value={value} text={`${value} HP`} />
    </View>
  );
}

export function Pill({ label, filled = false }: { label: string; filled?: boolean }) {
  const colors = useThemeColors();
  return (
    <View
      style={[
        styles.pill,
        { borderColor: filled ? colors.primary : colors.border, backgroundColor: filled ? colors.primary : colors.card },
      ]}
    >
      <Text style={[styles.pillText, { color: filled ? colors.primaryForeground : colors.foreground }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    height: spacing.sm,
    borderRadius: shape.full,
    overflow: "hidden",
  },
  fill: {
    height: "100%",
    borderRadius: shape.full,
  },
  health: {
    gap: spacing.sm,
  },
  healthLabel: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  strong: {
    ...typeScale.label,
    fontWeight: "600",
  },
  caption: {
    ...typeScale.label,
  },
  pill: {
    alignSelf: "flex-start",
    borderWidth: 1,
    borderRadius: shape.full,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
  },
  pillText: {
    ...typeScale.label,
    fontWeight: "600",
    textTransform: "capitalize",
  },
});

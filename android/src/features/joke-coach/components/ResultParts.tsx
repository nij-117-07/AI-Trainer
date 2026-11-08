// src/features/joke-coach/components/ResultParts.tsx
/** Small result pieces shared by the Joke Coach modes: score bars, bullet lists, and empty notes. */
import { StyleSheet, Text, View } from "react-native";
import { radius, spacing, useThemeColors } from "@/theme";
import { MarkdownText } from "@/components/tool/MarkdownText";

export function ScoreBar({ label, value, max = 10 }: { label: string; value: number; max?: number }) {
  const colors = useThemeColors();
  const percent = Math.min(100, (value / max) * 100);
  return (
    <View style={styles.score}>
      <View style={styles.scoreRow}>
        <Text style={[styles.scoreLabel, { color: colors.mutedForeground }]}>{label}</Text>
        <Text style={[styles.scoreValue, { color: colors.foreground }]}>
          {value.toFixed(1)}/{max}
        </Text>
      </View>
      <View style={[styles.track, { backgroundColor: colors.muted }]}>
        <View style={[styles.fill, { backgroundColor: colors.primary, width: `${percent}%` }]} />
      </View>
    </View>
  );
}

export function BulletList({ items, numbered = false }: { items: string[]; numbered?: boolean }) {
  if (items.length === 0) return <EmptyNote message="Nothing was returned." />;
  return (
    <MarkdownText
      content={items
        .map((item, index) => (numbered ? `${index + 1}. ${item}` : `- ${item}`))
        .join("\n")}
    />
  );
}

export function EmptyNote({ message }: { message: string }) {
  const colors = useThemeColors();
  return <Text style={[styles.empty, { color: colors.mutedForeground }]}>{message}</Text>;
}

export function Label({ children }: { children: string }) {
  const colors = useThemeColors();
  return <Text style={[styles.label, { color: colors.mutedForeground }]}>{children}</Text>;
}

const styles = StyleSheet.create({
  score: {
    gap: spacing.xs,
  },
  scoreRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  scoreLabel: {
    fontSize: 14,
  },
  scoreValue: {
    fontSize: 14,
    fontWeight: "600",
  },
  track: {
    height: 6,
    borderRadius: radius.full,
    overflow: "hidden",
  },
  fill: {
    height: "100%",
  },
  empty: {
    fontSize: 14,
    lineHeight: 20,
  },
  label: {
    fontSize: 13,
    fontWeight: "600",
  },
});

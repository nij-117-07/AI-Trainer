// src/features/confidence-builder/components/HistoryPanel.tsx
/** History tab: a summary of practice and one row per finished task, newest first. */
import { StyleSheet, Text, View } from "react-native";
import { HeartHandshake, TrendingUp } from "lucide-react-native";
import { shape, spacing, typeScale, useThemeColors } from "@/theme";
import { EmptyHint } from "@/components/tool/EmptyHint";
import { Panel } from "@/components/tool/FormControls";
import { focusOptions } from "../options";
import type { ConfidenceEntry, ConfidenceSummary } from "../types";

export function HistoryPanel({ entries, summary }: { entries: ConfidenceEntry[]; summary: ConfidenceSummary }) {
  if (entries.length === 0) {
    return (
      <EmptyHint
        icon={HeartHandshake}
        title="No tasks finished yet"
        hint="Finish a task and it appears here with your before and after ratings."
      />
    );
  }

  return (
    <View style={styles.list}>
      <SummaryPanel summary={summary} />
      {[...entries].reverse().map((entry) => (
        <EntryRow key={entry.id} entry={entry} />
      ))}
    </View>
  );
}

function SummaryPanel({ summary }: { summary: ConfidenceSummary }) {
  const colors = useThemeColors();
  const gain =
    summary.averageGain === null
      ? "Not enough yet"
      : `${summary.averageGain > 0 ? "+" : ""}${summary.averageGain.toFixed(1)} on average`;

  return (
    <Panel>
      <Text accessibilityRole="header" style={[typeScale.title, { color: colors.foreground }]}>
        Your progress
      </Text>
      <View style={styles.stats}>
        <Stat label="Tasks finished" value={String(summary.count)} />
        <Stat label="Days practised" value={String(summary.daysPracticed)} />
      </View>
      <View style={styles.gainRow}>
        <TrendingUp size={16} color={colors.primary} />
        <Text style={[typeScale.body, { color: colors.foreground }]}>Confidence change: {gain}</Text>
      </View>
    </Panel>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  const colors = useThemeColors();
  return (
    <View style={styles.stat}>
      <Text style={[typeScale.headline, { color: colors.foreground }]}>{value}</Text>
      <Text style={[typeScale.caption, { color: colors.mutedForeground }]}>{label}</Text>
    </View>
  );
}

function EntryRow({ entry }: { entry: ConfidenceEntry }) {
  const colors = useThemeColors();
  const focus = focusOptions.find((option) => option.value === entry.focus)?.label ?? entry.focus;
  const date = new Date(entry.completedAt).toLocaleDateString();
  const change = entry.after - entry.before;
  const changeText = change > 0 ? `up ${change}` : change < 0 ? `down ${Math.abs(change)}` : "no change";

  return (
    <View style={[styles.row, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <Text style={[typeScale.title, { color: colors.foreground }]}>{entry.title}</Text>
      <Text style={[typeScale.caption, { color: colors.mutedForeground }]}>
        {focus} · {date}
      </Text>
      <Text style={[typeScale.body, { color: colors.foreground }]}>
        Confidence {entry.before} to {entry.after} of 5, {changeText}
      </Text>
      {entry.reflection !== "" && <Text style={[typeScale.body, { color: colors.mutedForeground }]}>{entry.reflection}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  list: {
    gap: spacing.sm,
  },
  stats: {
    flexDirection: "row",
    gap: spacing.lg,
  },
  stat: {
    flex: 1,
    gap: spacing.xs,
  },
  gainRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  row: {
    borderWidth: 1,
    borderRadius: shape.lg,
    padding: spacing.md,
    gap: spacing.xs,
  },
});

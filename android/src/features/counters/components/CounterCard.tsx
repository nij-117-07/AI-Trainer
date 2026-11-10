// src/features/counters/components/CounterCard.tsx
/** One counter: the count against its target, with buttons to change it. Delete asks first. */
import { Alert, Pressable, StyleSheet, Text, View } from "react-native";
import { Plus, Minus, RotateCcw, Trash2 } from "lucide-react-native";
import { radius, spacing, useThemeColors } from "@/theme";
import { Panel } from "@/components/tool/FormControls";
import { progressOf } from "../lib/counters";
import type { Counter } from "../types";
import { PillButton } from "./PillButton";

interface CounterCardProps {
  counter: Counter;
  onChange: (delta: number) => void;
  onReset: () => void;
  onDelete: () => void;
}

export function CounterCard({ counter, onChange, onReset, onDelete }: CounterCardProps) {
  const colors = useThemeColors();
  const progress = progressOf(counter.count, counter.target);
  const reached = counter.count >= counter.target;

  function confirmDelete() {
    Alert.alert(`Delete ${counter.name}?`, "Its count will be removed.", [
      { text: "Cancel", style: "cancel" },
      { text: "Delete", style: "destructive", onPress: onDelete },
    ]);
  }

  return (
    <Panel>
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.foreground }]} numberOfLines={1}>
          {counter.name}
        </Text>
        <Pressable onPress={confirmDelete} accessibilityRole="button" accessibilityLabel={`Delete ${counter.name}`} hitSlop={8} style={styles.deleteButton}>
          <Trash2 size={18} color={colors.destructive} />
        </Pressable>
      </View>

      <View style={styles.countRow}>
        <Text style={[styles.count, { color: colors.foreground }]}>{counter.count}</Text>
        <Text style={[styles.target, { color: colors.mutedForeground }]}>of {counter.target}</Text>
      </View>

      <View
        style={[styles.track, { backgroundColor: colors.muted }]}
        accessibilityRole="progressbar"
        accessibilityValue={{ min: 0, max: counter.target, now: counter.count }}
      >
        <View style={[styles.fill, { backgroundColor: colors.primary, width: `${progress * 100}%` }]} />
      </View>
      <Text style={[styles.status, { color: reached ? colors.primary : colors.mutedForeground }]}>
        {reached ? "Goal reached" : `${counter.target - counter.count} to go`}
      </Text>

      <View style={styles.buttons}>
        <PillButton label="−1" icon={Minus} disabled={counter.count === 0} onPress={() => onChange(-1)} />
        <PillButton label="+1" icon={Plus} primary onPress={() => onChange(1)} />
        <PillButton label="Reset" icon={RotateCcw} disabled={counter.count === 0} onPress={onReset} />
      </View>
    </Panel>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  title: {
    flex: 1,
    fontSize: 17,
    fontWeight: "600",
  },
  deleteButton: {
    width: 36,
    height: 36,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: radius.full,
  },
  countRow: {
    flexDirection: "row",
    alignItems: "baseline",
    gap: spacing.sm,
  },
  count: {
    fontSize: 40,
    fontWeight: "700",
    letterSpacing: -1,
    fontVariant: ["tabular-nums"],
  },
  target: {
    fontSize: 16,
  },
  track: {
    height: 8,
    borderRadius: radius.full,
    overflow: "hidden",
  },
  fill: {
    height: 8,
    borderRadius: radius.full,
  },
  status: {
    fontSize: 13,
    lineHeight: 18,
  },
  buttons: {
    flexDirection: "row",
    gap: spacing.sm,
  },
});

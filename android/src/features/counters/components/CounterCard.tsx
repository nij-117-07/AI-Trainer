// src/features/counters/components/CounterCard.tsx
/** One counter: the count against its target, with icon buttons to change it. Delete asks first. */
import { Alert, Pressable, StyleSheet, Text, View } from "react-native";
import { Minus, Plus, RotateCcw, Trash2 } from "lucide-react-native";
import { cardPadding, shape, spacing, touchTarget, typeScale, useThemeColors } from "@/theme";
import { pointerCursor } from "@/components/tool/FormControls";
import { progressOf } from "../lib/counters";
import type { Counter } from "../types";
import { IconButton } from "./IconButton";

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
    <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <View style={styles.header}>
        <Text accessibilityRole="header" style={[styles.title, { color: colors.foreground }]} numberOfLines={1}>
          {counter.name}
        </Text>
        <Pressable
          onPress={confirmDelete}
          accessibilityRole="button"
          accessibilityLabel={`Delete ${counter.name}`}
          style={({ pressed }) => [styles.deleteButton, pointerCursor, pressed && styles.pressed]}
        >
          <Trash2 size={20} color={colors.destructive} />
        </Pressable>
      </View>

      <View style={styles.countRow}>
        <Text style={[styles.count, { color: colors.foreground }]}>{counter.count}</Text>
        <Text style={[typeScale.label, { color: colors.mutedForeground }]}>of {counter.target}</Text>
      </View>

      <View
        style={[styles.track, { backgroundColor: colors.muted }]}
        accessibilityRole="progressbar"
        accessibilityLabel={`${counter.name} progress`}
        accessibilityValue={{ min: 0, max: counter.target, now: counter.count }}
      >
        <View style={[styles.fill, { backgroundColor: colors.primary, width: `${progress * 100}%` }]} />
      </View>
      <Text
        accessibilityLiveRegion="polite"
        style={[typeScale.label, { color: reached ? colors.primary : colors.mutedForeground }]}
      >
        {reached ? "Goal reached" : `${counter.target - counter.count} to go`}
      </Text>

      <View style={styles.buttons}>
        <IconButton
          accessibilityLabel={`Reset ${counter.name}`}
          icon={RotateCcw}
          disabled={counter.count === 0}
          onPress={onReset}
        />
        <View style={styles.stepButtons}>
          <IconButton
            accessibilityLabel={`Subtract 1 from ${counter.name}`}
            icon={Minus}
            disabled={counter.count === 0}
            onPress={() => onChange(-1)}
          />
          <IconButton accessibilityLabel={`Add 1 to ${counter.name}`} icon={Plus} primary onPress={() => onChange(1)} />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
    borderRadius: shape.lg,
    padding: cardPadding.compact,
    gap: spacing.md,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  title: {
    flex: 1,
    ...typeScale.title,
  },
  deleteButton: {
    width: touchTarget,
    height: touchTarget,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: shape.full,
  },
  countRow: {
    flexDirection: "row",
    alignItems: "baseline",
    gap: spacing.sm,
  },
  count: {
    fontSize: 40,
    lineHeight: 48,
    fontWeight: "700",
    letterSpacing: -1,
    fontVariant: ["tabular-nums"],
  },
  track: {
    height: 8,
    borderRadius: shape.full,
    overflow: "hidden",
  },
  fill: {
    height: 8,
    borderRadius: shape.full,
  },
  buttons: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  stepButtons: {
    flexDirection: "row",
    gap: spacing.md,
  },
  pressed: {
    opacity: 0.85,
  },
});

// src/features/confidence-builder/components/ConfidenceSetCard.tsx
/** One saved task set in the list: focus, comfort, what is coming up, the task count, and a chevron. The whole row opens it. */
import { Pressable, StyleSheet, Text, View } from "react-native";
import { ChevronRight } from "lucide-react-native";
import { shape, spacing, typeScale, useThemeColors } from "@/theme";
import { comfortOptions, focusLabelOf } from "../options";
import type { ConfidenceSet } from "../types";

interface ConfidenceSetCardProps {
  set: ConfidenceSet;
  onOpen: () => void;
}

export function ConfidenceSetCard({ set, onOpen }: ConfidenceSetCardProps) {
  const colors = useThemeColors();
  const tasks = set.result.tasks.length;
  const comfort = comfortOptions.find((option) => option.value === set.form.comfort)?.label ?? set.form.comfort;
  const updated = new Date(set.updatedAt).toLocaleDateString();
  const coming = set.form.situation.trim();

  return (
    <Pressable
      onPress={onOpen}
      accessibilityRole="button"
      accessibilityLabel={`Open ${focusLabelOf(set.form.focus)} tasks`}
      style={({ pressed }) => [
        styles.row,
        { backgroundColor: colors.card, borderColor: colors.border },
        pressed && { backgroundColor: colors.muted },
      ]}
    >
      <View style={styles.body}>
        <Text numberOfLines={1} style={[styles.title, { color: colors.foreground }]}>
          {focusLabelOf(set.form.focus)}
        </Text>
        <Text numberOfLines={1} style={[typeScale.caption, { color: colors.mutedForeground }]}>
          Comfort {comfort} · {tasks} task{tasks === 1 ? "" : "s"} · Updated {updated}
        </Text>
        {coming !== "" && (
          <Text numberOfLines={1} style={[typeScale.caption, { color: colors.mutedForeground }]}>
            Coming up: {coming}
          </Text>
        )}
      </View>
      <ChevronRight size={20} color={colors.mutedForeground} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    minHeight: 72,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    borderWidth: 1,
    borderRadius: shape.lg,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
  },
  body: {
    flex: 1,
    gap: spacing.xs,
  },
  title: {
    ...typeScale.title,
  },
});

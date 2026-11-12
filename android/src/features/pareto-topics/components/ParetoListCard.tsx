// src/features/pareto-topics/components/ParetoListCard.tsx
/** One saved topic list: field, goal and level, the topic count with kept count, and a chevron. The whole row opens it. */
import { Pressable, StyleSheet, Text, View } from "react-native";
import { ChevronRight } from "lucide-react-native";
import { shape, spacing, typeScale, useThemeColors } from "@/theme";
import { keptCount } from "@/lib/kept";
import { formSummary } from "../options";
import type { ParetoList } from "../types";

interface ParetoListCardProps {
  list: ParetoList;
  onOpen: () => void;
}

export function ParetoListCard({ list, onOpen }: ParetoListCardProps) {
  const colors = useThemeColors();
  const topics = list.result.topics.length;
  const kept = keptCount(list.result.topics);
  const updated = new Date(list.updatedAt).toLocaleDateString();

  return (
    <Pressable
      onPress={onOpen}
      accessibilityRole="button"
      accessibilityLabel={`Open ${list.form.field}`}
      style={({ pressed }) => [
        styles.row,
        { backgroundColor: colors.card, borderColor: colors.border },
        pressed && { backgroundColor: colors.muted },
      ]}
    >
      <View style={styles.body}>
        <Text numberOfLines={1} style={[styles.field, { color: colors.foreground }]}>
          {list.form.field}
        </Text>
        <Text numberOfLines={1} style={[typeScale.caption, { color: colors.mutedForeground }]}>
          {formSummary(list.form)} · {topics} topic{topics === 1 ? "" : "s"} · {kept} kept · Updated {updated}
        </Text>
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
  field: {
    ...typeScale.title,
  },
});

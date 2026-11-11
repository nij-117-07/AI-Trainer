// src/features/skill-architect/components/SkillTreeRow.tsx
/** One saved skill tree on the list page: its topic and how many skills are learned. The whole row opens it. */
import { Pressable, StyleSheet, Text, View } from "react-native";
import { ChevronRight, Layers } from "lucide-react-native";
import { shape, spacing, typeScale, useThemeColors } from "@/theme";
import type { SkillArchitectTree } from "../types";
import { treeProgress } from "../lib/progress";

interface SkillTreeRowProps {
  tree: SkillArchitectTree;
  onOpen: () => void;
}

export function SkillTreeRow({ tree, onOpen }: SkillTreeRowProps) {
  const colors = useThemeColors();
  const tone = colors.tone.emerald;
  const progress = treeProgress(tree);

  return (
    <Pressable
      onPress={onOpen}
      accessibilityRole="button"
      accessibilityLabel={`Open ${tree.topic}`}
      style={({ pressed }) => [
        styles.row,
        { backgroundColor: colors.card, borderColor: colors.border },
        pressed && { backgroundColor: colors.muted },
      ]}
    >
      <View style={[styles.iconTile, { backgroundColor: tone.bg, borderColor: tone.border }]}>
        <Layers size={20} color={tone.fg} />
      </View>
      <View style={styles.body}>
        <Text numberOfLines={1} style={[styles.title, { color: colors.foreground }]}>
          {tree.topic}
        </Text>
        <Text style={[styles.meta, { color: colors.mutedForeground }]}>
          {progress.done} of {progress.total} skills
        </Text>
      </View>
      <ChevronRight size={20} color={colors.mutedForeground} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    minHeight: 72,
    borderWidth: 1,
    borderRadius: shape.lg,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  iconTile: {
    width: 40,
    height: 40,
    borderRadius: shape.md,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  body: {
    flex: 1,
    gap: spacing.xs,
  },
  title: {
    ...typeScale.body,
    fontWeight: "600",
  },
  meta: {
    ...typeScale.caption,
  },
});

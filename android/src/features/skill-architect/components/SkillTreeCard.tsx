// src/features/skill-architect/components/SkillTreeCard.tsx
/** One saved skill tree on the list page: topic, level and root-skill counts, and open/delete actions. */
import { Pressable, StyleSheet, Text, View } from "react-native";
import { ArrowRight, Layers, Trash2 } from "lucide-react-native";
import { radius, spacing, useThemeColors } from "@/theme";
import type { SkillArchitectTree } from "../types";
import { shortDate, treeStats } from "../lib/trees";

interface SkillTreeCardProps {
  tree: SkillArchitectTree;
  onOpen: () => void;
  onDelete: () => void;
}

export function SkillTreeCard({ tree, onOpen, onDelete }: SkillTreeCardProps) {
  const colors = useThemeColors();
  const tone = colors.tone.emerald;
  const stats = treeStats(tree);

  return (
    <Pressable
      onPress={onOpen}
      accessibilityRole="button"
      accessibilityLabel={`Open ${tree.topic}`}
      style={({ pressed }) => [
        styles.card,
        { backgroundColor: colors.card, borderColor: colors.border },
        pressed && { opacity: 0.85 },
      ]}
    >
      <View style={styles.header}>
        <View style={[styles.iconTile, { backgroundColor: tone.bg, borderColor: tone.border }]}>
          <Layers size={20} color={tone.fg} />
        </View>
        <Pressable
          onPress={onDelete}
          accessibilityRole="button"
          accessibilityLabel={`Delete ${tree.topic}`}
          hitSlop={8}
          style={({ pressed }) => [styles.deleteButton, { borderColor: colors.border }, pressed && { backgroundColor: colors.muted }]}
        >
          <Trash2 size={16} color={colors.mutedForeground} />
        </Pressable>
      </View>

      <View style={styles.body}>
        <Text style={[styles.title, { color: colors.foreground }]}>{tree.topic}</Text>
        <Text style={[styles.meta, { color: colors.mutedForeground }]}>
          {stats.levelCount} level{stats.levelCount === 1 ? "" : "s"} · {stats.rootSkillCount} root skill
          {stats.rootSkillCount === 1 ? "" : "s"}
        </Text>
        <Text style={[styles.meta, { color: colors.mutedForeground }]}>Updated {shortDate(tree.updatedAt)}</Text>
      </View>

      <View style={styles.footer}>
        <Text style={[styles.open, { color: colors.primary }]}>Open skill tree</Text>
        <ArrowRight size={16} color={colors.primary} />
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
    borderRadius: radius["2xl"],
    padding: spacing.lg,
    gap: spacing.md,
  },
  header: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
  },
  iconTile: {
    width: 44,
    height: 44,
    borderRadius: radius.lg,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  deleteButton: {
    width: 36,
    height: 36,
    borderRadius: radius.full,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  body: {
    gap: spacing.xs,
  },
  title: {
    fontSize: 17,
    fontWeight: "600",
  },
  meta: {
    fontSize: 13,
    lineHeight: 18,
  },
  footer: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
  },
  open: {
    fontSize: 14,
    fontWeight: "600",
  },
});

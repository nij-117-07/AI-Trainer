// src/features/skill-architect/components/LevelCard.tsx
/**
 * One level of the tree as a list of skill rows. The box ticks a skill; the rest of the row opens it.
 */
import { Pressable, StyleSheet, Text, View } from "react-native";
import { ChevronRight } from "lucide-react-native";
import { shape, spacing, touchTarget, typeScale, useThemeColors } from "@/theme";
import { ErrorBoundary } from "@/components/tool/ErrorBoundary";
import type { SkillLevel } from "../types";
import { levelProgress } from "../lib/progress";
import { skillStatus } from "../lib/selection";
import { skillStatusStyle } from "./SkillStatus";

interface LevelCardProps {
  level: SkillLevel;
  index: number;
  completedSkills: string[];
  selectedSkill: number | null;
  onOpenSkill: (skillIndex: number) => void;
  onToggleSkill: (skill: string) => void;
}

export function LevelCard(props: LevelCardProps) {
  return (
    <ErrorBoundary label={`Level ${props.index + 1}`}>
      <LevelCardBody {...props} />
    </ErrorBoundary>
  );
}

function LevelCardBody({ level, index, completedSkills, selectedSkill, onOpenSkill, onToggleSkill }: LevelCardProps) {
  const colors = useThemeColors();
  const progress = levelProgress(level, completedSkills);

  return (
    <View style={[styles.level, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <View style={styles.header}>
        <View style={[styles.badge, { backgroundColor: colors.muted }]}>
          <Text style={[styles.badgeText, { color: colors.primary }]}>{index + 1}</Text>
        </View>
        <Text accessibilityRole="header" numberOfLines={2} style={[styles.levelName, { color: colors.foreground }]}>
          {level.levelName.trim() || `Level ${index + 1}`}
        </Text>
        <Text style={[styles.progress, { color: colors.mutedForeground }]}>
          {progress.done} of {progress.total}
        </Text>
      </View>

      {level.rootSkills.map((skill, skillIndex) => {
        const status = skillStatus(level, skill, completedSkills);
        const { label, Icon, color } = skillStatusStyle(status, colors);
        const learned = status === "learned";
        const selected = selectedSkill === skillIndex;
        return (
          <View
            key={`${skill}-${skillIndex}`}
            style={[styles.skillRow, selected && { backgroundColor: colors.muted }]}
          >
            <Pressable
              onPress={() => onToggleSkill(skill)}
              accessibilityRole="checkbox"
              accessibilityState={{ checked: learned }}
              accessibilityLabel={learned ? `Mark ${skill} as not learned` : `Mark ${skill} as learned`}
              style={styles.check}
            >
              <Icon size={22} color={color} />
            </Pressable>
            <Pressable
              onPress={() => onOpenSkill(skillIndex)}
              accessibilityRole="button"
              accessibilityLabel={`Open ${skill}`}
              accessibilityState={{ selected }}
              style={styles.skillText}
            >
              <Text numberOfLines={2} style={[styles.skillName, { color: colors.foreground }]}>
                {skill}
              </Text>
              <Text style={[styles.status, { color }]}>{label}</Text>
            </Pressable>
            <ChevronRight size={18} color={colors.mutedForeground} />
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  level: {
    borderWidth: 1,
    borderRadius: shape.lg,
    padding: spacing.sm,
    gap: spacing.xs,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    paddingHorizontal: spacing.sm,
    paddingTop: spacing.xs,
  },
  badge: {
    width: 28,
    height: 28,
    borderRadius: shape.full,
    alignItems: "center",
    justifyContent: "center",
  },
  badgeText: {
    ...typeScale.caption,
    fontWeight: "700",
  },
  levelName: {
    flex: 1,
    ...typeScale.body,
    fontWeight: "600",
  },
  progress: {
    ...typeScale.caption,
    fontWeight: "600",
  },
  skillRow: {
    flexDirection: "row",
    alignItems: "center",
    minHeight: touchTarget,
    borderRadius: shape.md,
    paddingRight: spacing.md,
    gap: spacing.xs,
  },
  check: {
    width: touchTarget,
    height: touchTarget,
    alignItems: "center",
    justifyContent: "center",
  },
  skillText: {
    flex: 1,
    paddingVertical: spacing.sm,
    gap: spacing.xs,
  },
  skillName: {
    ...typeScale.body,
  },
  status: {
    ...typeScale.caption,
    fontWeight: "600",
  },
});

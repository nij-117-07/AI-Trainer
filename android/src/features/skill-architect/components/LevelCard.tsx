// src/features/skill-architect/components/LevelCard.tsx
/**
 * One stage of the progression tree. Root skills open by default; the other sections expand on tap.
 */
import { useState, type ReactNode } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { ChevronDown, ChevronUp, GitBranch, Lightbulb, ListChecks, Unlock, type LucideIcon } from "lucide-react-native";
import { radius, spacing, useThemeColors } from "@/theme";
import { ErrorBoundary } from "@/components/tool/ErrorBoundary";
import { MarkdownText } from "@/components/tool/MarkdownText";
import { Panel } from "@/components/tool/FormControls";
import type { SkillLevel } from "../types";

type SectionKey = "rootSkills" | "howItWorks" | "proofOfMastery" | "unlockCondition";

interface LevelSection {
  key: SectionKey;
  title: string;
  icon: LucideIcon;
  body: ReactNode;
}

interface LevelCardProps {
  level: SkillLevel;
  index: number;
}

export function LevelCard({ level, index }: LevelCardProps) {
  return (
    <ErrorBoundary label={`Level ${index + 1}`}>
      <LevelCardBody level={level} index={index} />
    </ErrorBoundary>
  );
}

function LevelCardBody({ level, index }: LevelCardProps) {
  const colors = useThemeColors();
  const [open, setOpen] = useState<Partial<Record<SectionKey, boolean>>>({ rootSkills: true });

  const sections: LevelSection[] = [];
  if (level.rootSkills.length > 0) {
    sections.push({
      key: "rootSkills",
      title: "Root skills",
      icon: GitBranch,
      body: (
        <View style={styles.bullets}>
          {level.rootSkills.map((skill, skillIndex) => (
            <View key={`${skill}-${skillIndex}`} style={styles.bulletRow}>
              <Text style={[styles.bullet, { color: colors.primary }]}>•</Text>
              <Text style={[styles.bulletText, { color: colors.foreground }]}>{skill}</Text>
            </View>
          ))}
        </View>
      ),
    });
  }
  if (level.howItWorks.trim() !== "") {
    sections.push({ key: "howItWorks", title: "How it works", icon: Lightbulb, body: <MarkdownText content={level.howItWorks.trim()} /> });
  }
  if (level.proofOfMastery.trim() !== "") {
    sections.push({
      key: "proofOfMastery",
      title: "Proof of mastery",
      icon: ListChecks,
      body: <MarkdownText content={level.proofOfMastery.trim()} />,
    });
  }
  if (level.unlockCondition.trim() !== "") {
    sections.push({
      key: "unlockCondition",
      title: "Unlock condition",
      icon: Unlock,
      body: <MarkdownText content={level.unlockCondition.trim()} />,
    });
  }

  function toggle(key: SectionKey) {
    setOpen((prev) => ({ ...prev, [key]: !prev[key] }));
  }

  return (
    <Panel>
      <View style={styles.header}>
        <View style={[styles.badge, { backgroundColor: colors.muted }]}>
          <Text style={[styles.badgeText, { color: colors.primary }]}>{index + 1}</Text>
        </View>
        <Text style={[styles.levelName, { color: colors.foreground }]}>
          {level.levelName.trim() || `Level ${index + 1}`}
        </Text>
      </View>

      <View style={[styles.sections, { borderColor: colors.border }]}>
        {sections.map((section) => {
          const expanded = !!open[section.key];
          const Icon = section.icon;
          return (
            <View key={section.key} style={[styles.section, { borderColor: colors.border }]}>
              <Pressable
                onPress={() => toggle(section.key)}
                accessibilityRole="button"
                accessibilityState={{ expanded }}
                style={styles.sectionHeader}
              >
                <Icon size={16} color={colors.primary} />
                <Text style={[styles.sectionTitle, { color: colors.foreground }]}>{section.title}</Text>
                {expanded ? (
                  <ChevronUp size={18} color={colors.mutedForeground} />
                ) : (
                  <ChevronDown size={18} color={colors.mutedForeground} />
                )}
              </Pressable>
              {expanded && <View style={styles.sectionBody}>{section.body}</View>}
            </View>
          );
        })}
      </View>
    </Panel>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
  },
  badge: {
    width: 28,
    height: 28,
    borderRadius: radius.full,
    alignItems: "center",
    justifyContent: "center",
  },
  badgeText: {
    fontSize: 14,
    fontWeight: "700",
  },
  levelName: {
    flex: 1,
    fontSize: 16,
    fontWeight: "600",
  },
  sections: {
    borderTopWidth: 1,
  },
  section: {
    borderBottomWidth: 1,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    paddingVertical: spacing.md,
  },
  sectionTitle: {
    flex: 1,
    fontSize: 15,
    fontWeight: "600",
  },
  sectionBody: {
    paddingBottom: spacing.md,
  },
  bullets: {
    gap: spacing.sm,
  },
  bulletRow: {
    flexDirection: "row",
    gap: spacing.sm,
  },
  bullet: {
    fontSize: 15,
    lineHeight: 22,
  },
  bulletText: {
    flex: 1,
    fontSize: 15,
    lineHeight: 22,
  },
});

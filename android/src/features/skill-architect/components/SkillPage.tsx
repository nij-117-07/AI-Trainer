// src/features/skill-architect/components/SkillPage.tsx
/** One skill: its state and the action that changes it, then the level notes that apply to it. */
import { StyleSheet, Text, View } from "react-native";
import { Check, Lightbulb, ListChecks, Undo2, Unlock } from "lucide-react-native";
import { spacing, typeScale, useThemeColors } from "@/theme";
import { ActionButton } from "@/components/tool/FormControls";
import { ListenButton } from "@/components/tool/ListenButton";
import { MarkdownText } from "@/components/tool/MarkdownText";
import { Section } from "@/components/tool/Section";
import { SectionTitle } from "@/components/tool/SectionTitle";
import type { SkillLevel } from "../types";
import type { SkillStatus } from "../lib/selection";
import { SkillStatusLabel } from "./SkillStatus";

interface SkillPageProps {
  level: SkillLevel;
  levelIndex: number;
  skill: string;
  status: SkillStatus;
  onToggle: () => void;
}

export function SkillPage({ level, levelIndex, skill, status, onToggle }: SkillPageProps) {
  const colors = useThemeColors();
  const learned = status === "learned";
  const levelName = level.levelName.trim() || `Level ${levelIndex + 1}`;
  const notes = [
    { title: "How it works", icon: Lightbulb, text: level.howItWorks },
    { title: "Proof of mastery", icon: ListChecks, text: level.proofOfMastery },
    { title: "Unlock condition", icon: Unlock, text: level.unlockCondition },
  ].filter((note) => note.text.trim() !== "");

  return (
    <Section>
      <View style={styles.head}>
        <Text style={[styles.level, { color: colors.mutedForeground }]}>{levelName}</Text>
        <Text accessibilityRole="header" style={[styles.skill, { color: colors.foreground }]}>
          {skill}
        </Text>
        <SkillStatusLabel status={status} />
      </View>

      <ActionButton
        label={learned ? "Mark as not learned" : "Mark as learned"}
        icon={learned ? Undo2 : Check}
        variant="outline"
        onPress={onToggle}
      />

      {notes.map((note) => (
        <View key={note.title} style={styles.block}>
          <SectionTitle icon={note.icon} title={note.title} />
          <MarkdownText content={note.text.trim()} />
          <ListenButton text={note.text} label={note.title} />
        </View>
      ))}
    </Section>
  );
}

const styles = StyleSheet.create({
  head: {
    gap: spacing.xs,
  },
  level: {
    ...typeScale.caption,
    fontWeight: "600",
  },
  skill: {
    ...typeScale.title,
  },
  block: {
    gap: spacing.sm,
  },
});

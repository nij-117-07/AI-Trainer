// src/features/skill-architect/components/SkillArchitectResult.tsx
/**
 * Renders a skill tree as a stack of level cards, with the core philosophy, critical bottleneck,
 * and strategic navigation shown as callouts.
 */
import { Text } from "react-native";
import { BookOpen, Compass, Lightbulb } from "lucide-react-native";
import { useThemeColors } from "@/theme";
import { MarkdownText } from "@/components/tool/MarkdownText";
import { ResultCallout } from "@/components/tool/ResultCallout";
import { ListenButton } from "@/components/tool/ListenButton";
import { Section } from "@/components/tool/Section";
import type { SkillArchitectResponse } from "../types";
import { LevelCard } from "./LevelCard";

function hasText(value: string): boolean {
  return value.trim() !== "";
}

interface SkillArchitectResultProps {
  response: SkillArchitectResponse;
  completedSkills?: string[];
  onToggleSkill?: (skill: string) => void;
}

export function SkillArchitectResult({ response, completedSkills, onToggleSkill }: SkillArchitectResultProps) {
  const colors = useThemeColors();
  const levels = response.skillTreeLevels;

  return (
    <Section>
      {hasText(response.corePhilosophy) && (
        <ResultCallout icon={BookOpen} title="Core philosophy" tone="sky">
          <MarkdownText content={response.corePhilosophy.trim()} />
          <ListenButton text={response.corePhilosophy} label="Core philosophy" />
        </ResultCallout>
      )}

      {levels.length === 0 ? (
        <Text style={{ color: colors.mutedForeground, fontSize: 14 }}>No skill tree levels returned.</Text>
      ) : (
        levels.map((level, index) => (
          <LevelCard
            key={`${level.levelName}-${index}`}
            level={level}
            index={index}
            completedSkills={completedSkills}
            onToggleSkill={onToggleSkill}
          />
        ))
      )}

      {hasText(response.criticalBottleneck) && (
        <ResultCallout icon={Compass} title="Critical bottleneck" tone="amber">
          <MarkdownText content={response.criticalBottleneck.trim()} />
          <ListenButton text={response.criticalBottleneck} label="Critical bottleneck" />
        </ResultCallout>
      )}

      {hasText(response.strategicNavigation) && (
        <ResultCallout icon={Lightbulb} title="Strategic navigation" tone="emerald">
          <MarkdownText content={response.strategicNavigation.trim()} />
          <ListenButton text={response.strategicNavigation} label="Strategic navigation" />
        </ResultCallout>
      )}
    </Section>
  );
}

// src/features/skill-architect/components/SkillTreeDetail.tsx
/**
 * Detail view for one saved tree. Phones show the levels as a list, and a skill opens its own page.
 * Tablet and desktop show the levels beside the selected skill. Edit mode swaps the levels for TreeEditor.
 */
import { StyleSheet, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { MousePointerClick, Sparkles } from "lucide-react-native";
import { spacing, typeScale, useLayout, useThemeColors } from "@/theme";
import { ActionButton, Panel } from "@/components/tool/FormControls";
import { EmptyHint } from "@/components/tool/EmptyHint";
import { ListenButton } from "@/components/tool/ListenButton";
import { MarkdownText } from "@/components/tool/MarkdownText";
import { ResultCallout } from "@/components/tool/ResultCallout";
import { Section } from "@/components/tool/Section";
import type { SkillTreeState } from "../hooks/useSkillTree";
import type { TreeUpdate } from "../types";
import { treeProgress } from "../lib/progress";
import { findSkill, skillStatus, type SkillRef } from "../lib/selection";
import { LevelCard } from "./LevelCard";
import { SkillArchitectResult } from "./SkillArchitectResult";
import { SkillPage } from "./SkillPage";
import { TreeEditor } from "./TreeEditor";

interface SkillTreeDetailProps {
  state: SkillTreeState;
  selected: SkillRef | null;
  /** True on a phone with a skill open: the skill page replaces the levels. */
  skillPage: boolean;
  onSelect: (ref: SkillRef) => void;
}

export function SkillTreeDetail({ state, selected, skillPage, onSelect }: SkillTreeDetailProps) {
  const colors = useThemeColors();
  const router = useRouter();
  const { size } = useLayout();

  if (!state.loaded) {
    return <Text style={[styles.muted, { color: colors.mutedForeground }]}>Loading skill tree…</Text>;
  }

  const { tree } = state;

  if (!tree) {
    return (
      <Panel>
        <Text style={[styles.title, { color: colors.foreground }]}>Skill tree not found</Text>
        <Text style={[styles.muted, { color: colors.mutedForeground }]}>
          It may have been deleted. Return to the list to see your saved trees.
        </Text>
        <ActionButton
          label="Back to skill trees"
          variant="outline"
          onPress={() => router.replace("/learning/skill-architect" as never)}
        />
      </Panel>
    );
  }

  if (state.editing) {
    return <TreeEditor levels={state.draftLevels} onChange={state.setDraftLevels} />;
  }

  const levels = tree.response.skillTreeLevels;
  const progress = treeProgress(tree);
  const picked = findSkill(levels, selected);
  const page = picked ? (
    <SkillPage
      level={picked.level}
      levelIndex={picked.levelIndex}
      skill={picked.skill}
      status={skillStatus(picked.level, picked.skill, tree.completedSkills)}
      onToggle={() => state.toggle(picked.skill)}
    />
  ) : null;

  if (skillPage && page) return page;

  const levelList = (
    <View style={styles.levels}>
      <Text style={[styles.summary, { color: colors.mutedForeground }]}>
        {progress.done} of {progress.total} skills learned
      </Text>
      {levels.length === 0 ? (
        <Text style={[styles.muted, { color: colors.mutedForeground }]}>No skill tree levels returned.</Text>
      ) : (
        levels.map((level, levelIndex) => (
          <LevelCard
            key={`${level.levelName}-${levelIndex}`}
            level={level}
            index={levelIndex}
            completedSkills={tree.completedSkills}
            selectedSkill={picked?.levelIndex === levelIndex ? picked.skillIndex : null}
            onOpenSkill={(skillIndex) => onSelect({ level: levelIndex, skill: skillIndex })}
            onToggleSkill={state.toggle}
          />
        ))
      )}
    </View>
  );

  const wide = size !== "phone";

  return (
    <Section>
      {tree.lastUpdate && <LatestUpdate update={tree.lastUpdate} />}

      {wide ? (
        <View style={styles.split}>
          <View style={size === "desktop" ? styles.listDesktop : styles.listTablet}>{levelList}</View>
          <View style={styles.pane}>
            {page ?? (
              <EmptyHint
                icon={MousePointerClick}
                title="Select a skill"
                hint="Its level, how it works, and proof of mastery show here."
              />
            )}
          </View>
        </View>
      ) : (
        levelList
      )}

      <SkillArchitectResult response={tree.response} />
    </Section>
  );
}

function LatestUpdate({ update }: { update: TreeUpdate }) {
  const colors = useThemeColors();
  return (
    <ResultCallout icon={Sparkles} title="Latest update" tone="sky">
      {update.progressNote.trim() !== "" && (
        <Text style={[styles.muted, { color: colors.mutedForeground }]}>You said: {update.progressNote.trim()}</Text>
      )}
      {update.summary.trim() !== "" && <MarkdownText content={update.summary.trim()} />}
      {update.nextSteps.trim() !== "" && (
        <View style={styles.next}>
          <Text style={[styles.label, { color: colors.foreground }]}>What's next</Text>
          <MarkdownText content={update.nextSteps.trim()} />
          <ListenButton text={update.nextSteps} label="What's next" />
        </View>
      )}
    </ResultCallout>
  );
}

const styles = StyleSheet.create({
  title: {
    ...typeScale.title,
  },
  muted: {
    ...typeScale.body,
  },
  summary: {
    ...typeScale.caption,
    fontWeight: "600",
  },
  levels: {
    gap: spacing.sm,
  },
  split: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: spacing.lg,
  },
  listTablet: {
    flex: 2,
    minWidth: 0,
  },
  listDesktop: {
    width: 360,
  },
  pane: {
    flex: 1,
    minWidth: 0,
  },
  next: {
    gap: spacing.sm,
  },
  label: {
    ...typeScale.body,
    fontWeight: "600",
  },
});

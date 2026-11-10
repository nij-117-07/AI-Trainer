// src/features/skill-architect/components/SkillTreeDetail.tsx
/**
 * Detail view for one saved tree: topic, progress, edit and delete actions, the latest AI update,
 * and the level breakdown with tickable root skills. Edit mode swaps the breakdown for TreeEditor.
 */
import { Alert, StyleSheet, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { Check, Pencil, Sparkles, Trash2 } from "lucide-react-native";
import { spacing, useThemeColors } from "@/theme";
import { ActionButton, ErrorText, Panel } from "@/components/tool/FormControls";
import { MarkdownText } from "@/components/tool/MarkdownText";
import { ResultCallout } from "@/components/tool/ResultCallout";
import { ListenButton } from "@/components/tool/ListenButton";
import { Section } from "@/components/tool/Section";
import { TagList } from "@/components/tool/TagList";
import type { SkillTreeState } from "../hooks/useSkillTree";
import type { TreeUpdate } from "../types";
import { treeProgress } from "../lib/progress";
import { shortDate, treeStats } from "../lib/trees";
import { SkillArchitectResult } from "./SkillArchitectResult";
import { TreeEditor } from "./TreeEditor";

export function SkillTreeDetail({ state }: { state: SkillTreeState }) {
  const colors = useThemeColors();
  const router = useRouter();

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

  const stats = treeStats(tree);
  const progress = treeProgress(tree);

  async function handleDelete() {
    if (await state.remove()) router.replace("/learning/skill-architect" as never);
  }

  function confirmDelete() {
    Alert.alert(
      "Delete this skill tree?",
      `"${tree?.topic}" and its generated skill levels will be permanently removed.`,
      [
        { text: "Cancel", style: "cancel" },
        { text: "Delete", style: "destructive", onPress: () => void handleDelete() },
      ],
    );
  }

  return (
    <Section>
      <Panel>
        <Text style={[styles.title, { color: colors.foreground }]}>{tree.topic}</Text>
        <TagList
          items={[
            `${stats.levelCount} level${stats.levelCount === 1 ? "" : "s"}`,
            `${stats.rootSkillCount} root skill${stats.rootSkillCount === 1 ? "" : "s"}`,
            `${progress.done} of ${progress.total} done`,
            `Updated ${shortDate(tree.updatedAt)}`,
          ]}
        />

        {state.editing ? (
          <>
            <ActionButton label="Save changes" icon={Check} onPress={() => void state.saveEdit()} />
            <ActionButton label="Cancel" variant="outline" onPress={state.cancelEdit} />
          </>
        ) : (
          <>
            <ActionButton label="Edit tree" icon={Pencil} variant="outline" onPress={state.startEdit} />
            <ActionButton label="Delete skill tree" icon={Trash2} variant="outline" onPress={confirmDelete} />
          </>
        )}
        {state.editing && <ErrorText message={state.error} />}
      </Panel>

      {!state.editing && tree.lastUpdate && <LatestUpdate update={tree.lastUpdate} />}

      {state.editing ? (
        <TreeEditor levels={state.draftLevels} onChange={state.setDraftLevels} />
      ) : (
        <SkillArchitectResult
          response={tree.response}
          completedSkills={tree.completedSkills}
          onToggleSkill={state.toggle}
        />
      )}
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
    fontSize: 20,
    fontWeight: "700",
    marginBottom: spacing.xs,
  },
  muted: {
    fontSize: 14,
    lineHeight: 21,
  },
  next: {
    gap: spacing.sm,
  },
  label: {
    fontSize: 15,
    fontWeight: "600",
  },
});

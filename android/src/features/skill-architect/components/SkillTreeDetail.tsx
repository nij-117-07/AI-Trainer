// src/features/skill-architect/components/SkillTreeDetail.tsx
/** Detail view for one saved skill tree: topic, stats, delete action, and the level breakdown. */
import { useEffect, useState } from "react";
import { Alert, StyleSheet, Text } from "react-native";
import { useRouter } from "expo-router";
import { Trash2 } from "lucide-react-native";
import { spacing, useThemeColors } from "@/theme";
import { ActionButton, ErrorText, Panel } from "@/components/tool/FormControls";
import { Section } from "@/components/tool/Section";
import { TagList } from "@/components/tool/TagList";
import type { SkillArchitectTree } from "../types";
import { loadTrees, saveTrees } from "../lib/store";
import { findTree, removeTree, shortDate, treeStats } from "../lib/trees";
import { SkillArchitectResult } from "./SkillArchitectResult";

interface SkillTreeDetailProps {
  treeId: string;
}

export function SkillTreeDetail({ treeId }: SkillTreeDetailProps) {
  const colors = useThemeColors();
  const router = useRouter();
  const [trees, setTrees] = useState<SkillArchitectTree[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    loadTrees().then((list) => {
      if (!active) return;
      setTrees(list);
      setLoaded(true);
    });
    return () => {
      active = false;
    };
  }, []);

  const tree = findTree(trees, treeId);

  function confirmDelete() {
    if (!tree) return;
    Alert.alert(
      "Delete this skill tree?",
      `"${tree.topic}" and its generated skill levels will be permanently removed.`,
      [
        { text: "Cancel", style: "cancel" },
        { text: "Delete", style: "destructive", onPress: () => void handleDelete() },
      ],
    );
  }

  async function handleDelete() {
    if (!tree) return;
    setError(null);
    try {
      await saveTrees(removeTree(trees, tree.id));
      router.replace("/learning/skill-architect" as never);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete the skill tree.");
    }
  }

  if (!loaded) {
    return <Text style={[styles.muted, { color: colors.mutedForeground }]}>Loading skill tree…</Text>;
  }

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

  return (
    <Section>
      <Panel>
        <Text style={[styles.title, { color: colors.foreground }]}>{tree.topic}</Text>
        <TagList
          items={[
            `${stats.levelCount} level${stats.levelCount === 1 ? "" : "s"}`,
            `${stats.rootSkillCount} root skill${stats.rootSkillCount === 1 ? "" : "s"}`,
            `Updated ${shortDate(tree.updatedAt)}`,
          ]}
        />
        <ActionButton label="Delete skill tree" icon={Trash2} variant="outline" onPress={confirmDelete} />
        <ErrorText message={error} />
      </Panel>

      <SkillArchitectResult response={tree.response} />
    </Section>
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
});

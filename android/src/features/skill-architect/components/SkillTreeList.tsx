// src/features/skill-architect/components/SkillTreeList.tsx
/** Skill Architect landing page: create button, the saved tree cards, and delete confirmation. */
import { useCallback, useState } from "react";
import { Alert, StyleSheet, Text, View } from "react-native";
import { useFocusEffect, useRouter } from "expo-router";
import { Plus } from "lucide-react-native";
import { spacing, useThemeColors } from "@/theme";
import { ActionButton, ErrorText, Panel } from "@/components/tool/FormControls";
import { Section } from "@/components/tool/Section";
import type { SkillArchitectTree } from "../types";
import { loadTrees, saveTrees } from "../lib/store";
import { removeTree } from "../lib/trees";
import { SkillTreeCard } from "./SkillTreeCard";

export function SkillTreeList() {
  const colors = useThemeColors();
  const router = useRouter();
  const [trees, setTrees] = useState<SkillArchitectTree[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useFocusEffect(
    useCallback(() => {
      let active = true;
      loadTrees().then((list) => {
        if (!active) return;
        setTrees(list);
        setLoaded(true);
      });
      return () => {
        active = false;
      };
    }, []),
  );

  function open(tree: SkillArchitectTree) {
    router.push(`/learning/skill-architect/${tree.id}` as never);
  }

  function confirmDelete(tree: SkillArchitectTree) {
    Alert.alert(
      "Delete this skill tree?",
      `"${tree.topic}" and its generated skill levels will be permanently removed.`,
      [
        { text: "Cancel", style: "cancel" },
        { text: "Delete", style: "destructive", onPress: () => void handleDelete(tree.id) },
      ],
    );
  }

  async function handleDelete(id: string) {
    const next = removeTree(trees, id);
    setError(null);
    try {
      await saveTrees(next);
      setTrees(next);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete the skill tree.");
    }
  }

  return (
    <Section>
      <Text style={[styles.lead, { color: colors.mutedForeground }]}>
        Deconstruct any domain into its root skills and a level-wise progression tree.
      </Text>

      <ActionButton
        label="Create new skill"
        icon={Plus}
        onPress={() => router.push("/learning/skill-architect/new" as never)}
      />

      <ErrorText message={error} />

      {loaded && trees.length === 0 && (
        <Panel>
          <Text style={[styles.emptyTitle, { color: colors.foreground }]}>No skill trees yet</Text>
          <Text style={[styles.lead, { color: colors.mutedForeground }]}>
            Create your first skill tree for any topic to see the level-by-level breakdown.
          </Text>
        </Panel>
      )}

      <View style={styles.list}>
        {trees.map((tree) => (
          <SkillTreeCard key={tree.id} tree={tree} onOpen={() => open(tree)} onDelete={() => confirmDelete(tree)} />
        ))}
      </View>
    </Section>
  );
}

const styles = StyleSheet.create({
  lead: {
    fontSize: 14,
    lineHeight: 21,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: "600",
  },
  list: {
    gap: spacing.lg,
  },
});

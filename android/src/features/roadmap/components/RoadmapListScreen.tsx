// src/features/roadmap/components/RoadmapListScreen.tsx
/** Roadmap Planner home: the create form, then every saved roadmap with open and delete actions. */
import { useCallback, useState } from "react";
import { Alert, StyleSheet, Text } from "react-native";
import { useFocusEffect, useRouter } from "expo-router";
import { useThemeColors } from "@/theme";
import { ToolScreen } from "@/components/tool/ToolScreen";
import { ErrorText, Panel } from "@/components/tool/FormControls";
import { Section } from "@/components/tool/Section";
import { deleteRoadmap, loadRoadmaps } from "../lib/roadmap-store";
import type { Roadmap } from "../types";
import { CreateRoadmapPanel } from "./CreateRoadmapPanel";
import { RoadmapCard } from "./RoadmapCard";

function messageOf(err: unknown, fallback: string): string {
  return err instanceof Error ? err.message : fallback;
}

export function RoadmapListScreen() {
  const colors = useThemeColors();
  const router = useRouter();
  const [roadmaps, setRoadmaps] = useState<Roadmap[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(async () => {
    try {
      setRoadmaps(await loadRoadmaps());
      setError(null);
    } catch (err) {
      setError(messageOf(err, "Could not load your roadmaps."));
    } finally {
      setLoaded(true);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      void reload();
    }, [reload]),
  );

  function openRoadmap(id: string) {
    router.push(`/learning/roadmap/${id}` as never);
  }

  function confirmDelete(roadmap: Roadmap) {
    Alert.alert(
      "Delete this roadmap?",
      `"${roadmap.subject}" and all of its main points and subpoints will be permanently removed.`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => {
            deleteRoadmap(roadmap.id)
              .then(reload)
              .catch((err: unknown) => setError(messageOf(err, "Failed to delete the roadmap.")));
          },
        },
      ],
    );
  }

  return (
    <ToolScreen title="Roadmap Planner">
      <Section>
        <CreateRoadmapPanel onCreated={openRoadmap} />

        <ErrorText message={error} />

        {loaded && roadmaps.length === 0 ? (
          <Panel>
            <Text style={[styles.emptyTitle, { color: colors.foreground }]}>No roadmaps yet</Text>
            <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>
              Create your first learning roadmap and start planning a subject.
            </Text>
          </Panel>
        ) : null}

        {roadmaps.map((roadmap) => (
          <RoadmapCard
            key={roadmap.id}
            roadmap={roadmap}
            onOpen={() => openRoadmap(roadmap.id)}
            onDelete={() => confirmDelete(roadmap)}
          />
        ))}
      </Section>
    </ToolScreen>
  );
}

const styles = StyleSheet.create({
  emptyTitle: {
    fontSize: 16,
    fontWeight: "600",
  },
  emptyText: {
    fontSize: 14,
    lineHeight: 21,
  },
});

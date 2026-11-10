// src/features/roadmap/components/RoadmapListScreen.tsx
/** Roadmap Planner home: a New roadmap button, then every saved roadmap with its next step. */
import { useCallback, useState } from "react";
import { Alert, StyleSheet, Text } from "react-native";
import { useFocusEffect, useRouter } from "expo-router";
import { MapPinned, Plus } from "lucide-react-native";
import { spacing, useThemeColors } from "@/theme";
import { ActionButton, ErrorText } from "@/components/tool/FormControls";
import { EmptyHint } from "@/components/tool/EmptyHint";
import { Section } from "@/components/tool/Section";
import { ToolScreen } from "@/components/tool/ToolScreen";
import { deleteRoadmap, loadRoadmaps } from "../lib/roadmap-store";
import type { Roadmap } from "../types";
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
        <Text style={[styles.lead, { color: colors.mutedForeground }]}>
          Break a subject into main points, then tick them off as you learn.
        </Text>

        <ActionButton
          label="New roadmap"
          icon={Plus}
          onPress={() => router.push("/learning/roadmap/new" as never)}
        />

        <ErrorText message={error} />

        {loaded && roadmaps.length === 0 ? (
          <EmptyHint
            icon={MapPinned}
            title="No roadmaps yet"
            hint="Tap New roadmap to plan your first subject."
          />
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
  lead: {
    fontSize: 14,
    lineHeight: 21,
    paddingHorizontal: spacing.xs,
  },
});

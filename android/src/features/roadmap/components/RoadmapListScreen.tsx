// src/features/roadmap/components/RoadmapListScreen.tsx
/** Roadmap Planner home: every saved roadmap as a compact row. New roadmap is in the top bar, or the empty state. */
import { useCallback, useState } from "react";
import { StyleSheet, Text } from "react-native";
import { useFocusEffect, useRouter } from "expo-router";
import { MapPinned, Plus } from "lucide-react-native";
import { typeScale, useThemeColors } from "@/theme";
import { ActionButton, ErrorText } from "@/components/tool/FormControls";
import { CardGrid } from "@/components/tool/CardGrid";
import { EmptyHint } from "@/components/tool/EmptyHint";
import { Section } from "@/components/tool/Section";
import { ToolScreen } from "@/components/tool/ToolScreen";
import { loadRoadmaps } from "../lib/roadmap-store";
import type { Roadmap } from "../types";
import { HeaderAction } from "./HeaderAction";
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

  function openNew() {
    router.push("/learning/roadmap/new" as never);
  }

  return (
    <ToolScreen
      title="Roadmap Planner"
      wide
      headerRight={roadmaps.length > 0 ? <HeaderAction icon={Plus} label="New roadmap" onPress={openNew} /> : undefined}
    >
      <Section>
        <ErrorText message={error} />

        {!loaded ? <Text style={[styles.muted, { color: colors.mutedForeground }]}>Loading your roadmaps…</Text> : null}

        {loaded && roadmaps.length === 0 ? (
          <>
            <EmptyHint
              icon={MapPinned}
              title="No roadmaps yet"
              hint="Plan a subject as main points you can tick off as you learn."
            />
            <ActionButton label="New roadmap" icon={Plus} onPress={openNew} />
          </>
        ) : null}

        <CardGrid>
          {roadmaps.map((roadmap) => (
            <RoadmapCard key={roadmap.id} roadmap={roadmap} onOpen={() => openRoadmap(roadmap.id)} />
          ))}
        </CardGrid>
      </Section>
    </ToolScreen>
  );
}

const styles = StyleSheet.create({
  muted: {
    ...typeScale.body,
  },
});

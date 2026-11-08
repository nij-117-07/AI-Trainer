// src/features/roadmap/components/RoadmapDetailScreen.tsx
/**
 * Roadmap detail. Every edit updates the screen at once and saves to the device in order. Expanding
 * a main point can generate its subpoints with AI and merges the result into the latest roadmap.
 */
import { useEffect, useRef, useState } from "react";
import { Alert, Pressable, StyleSheet, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { ChevronDown, ChevronUp, MapPinned, ScrollText, Trash2 } from "lucide-react-native";
import { radius, spacing, useThemeColors } from "@/theme";
import { useAiSettings } from "@/features/ai-settings/providers/AiSettingsProvider";
import { ActionButton, ErrorText, Panel } from "@/components/tool/FormControls";
import { Section } from "@/components/tool/Section";
import { TagList } from "@/components/tool/TagList";
import { ToolScreen } from "@/components/tool/ToolScreen";
import { generateSubtopics } from "../lib/generators";
import { computeProgress } from "../lib/progress";
import {
  addMainPoint,
  addSubtopic,
  applyExpansion,
  buildExpansionRequest,
  removeMainPoint,
  removeSubtopic,
  renameMainPoint,
  renameSubtopic,
  toggleMainPoint,
  toggleSubtopic,
} from "../lib/roadmap-ops";
import { deleteRoadmap, getRoadmap, makeContext, saveRoadmap } from "../lib/roadmap-store";
import { ROADMAP_LIMITS } from "../lib/validation";
import type { Roadmap } from "../types";
import { AddRow } from "./ItemControls";
import { MainPointRow } from "./MainPointRow";
import { ProgressBar } from "./ProgressBar";

function messageOf(err: unknown, fallback: string): string {
  return err instanceof Error ? err.message : fallback;
}

interface RoadmapDetailScreenProps {
  roadmapId: string;
}

export function RoadmapDetailScreen({ roadmapId }: RoadmapDetailScreenProps) {
  const colors = useThemeColors();
  const router = useRouter();
  const { settings } = useAiSettings();
  const [roadmap, setRoadmap] = useState<Roadmap | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
  const [generatingId, setGeneratingId] = useState<string | null>(null);
  const [personaOpen, setPersonaOpen] = useState(false);
  const latest = useRef<Roadmap | null>(null);

  useEffect(() => {
    let active = true;
    getRoadmap(roadmapId)
      .then((found) => {
        if (!active) return;
        latest.current = found;
        setRoadmap(found);
      })
      .catch((err: unknown) => {
        if (active) setError(messageOf(err, "Could not load this roadmap."));
      })
      .finally(() => {
        if (active) setLoaded(true);
      });
    return () => {
      active = false;
    };
  }, [roadmapId]);

  function commit(change: (current: Roadmap) => Roadmap) {
    const current = latest.current;
    if (!current) return;
    const next = change(current);
    if (next === current) return;
    latest.current = next;
    setRoadmap(next);
    setError(null);
    saveRoadmap(next).catch((err: unknown) => setError(messageOf(err, "Failed to save changes.")));
  }

  function toggleExpand(id: string) {
    setExpandedIds((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  async function generateForPoint(pointId: string) {
    const current = latest.current;
    if (!current) return;
    const request = buildExpansionRequest(current, pointId);
    if (!request) return;
    setError(null);
    setGeneratingId(pointId);
    try {
      const expansion = await generateSubtopics(settings, request);
      commit((item) => applyExpansion(item, pointId, expansion, makeContext()));
      setExpandedIds((expanded) => new Set(expanded).add(pointId));
    } catch (err) {
      setError(messageOf(err, "Failed to generate subpoints."));
    } finally {
      setGeneratingId(null);
    }
  }

  function confirmDelete() {
    if (!roadmap) return;
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
              .then(() => router.replace("/learning/roadmap"))
              .catch((err: unknown) => setError(messageOf(err, "Failed to delete the roadmap.")));
          },
        },
      ],
    );
  }

  const progress = roadmap ? computeProgress(roadmap) : null;
  const generating = generatingId !== null;

  return (
    <ToolScreen title={roadmap?.subject ?? "Roadmap"}>
      {!loaded ? (
        <Panel>
          <Text style={[styles.muted, { color: colors.mutedForeground }]}>Loading roadmap…</Text>
        </Panel>
      ) : null}

      {loaded && !roadmap ? (
        <Panel>
          <Text style={[styles.title, { color: colors.foreground }]}>Roadmap not found</Text>
          <Text style={[styles.muted, { color: colors.mutedForeground }]}>
            It may have been deleted. Go back to your roadmaps to pick another one.
          </Text>
          <ActionButton label="Back to roadmaps" variant="outline" onPress={() => router.replace("/learning/roadmap")} />
        </Panel>
      ) : null}

      {roadmap && progress ? (
        <Section>
          <Panel>
            <View style={styles.heading}>
              <View style={[styles.iconTile, { backgroundColor: colors.tone.emerald.bg, borderColor: colors.tone.emerald.border }]}>
                <MapPinned size={20} color={colors.tone.emerald.fg} />
              </View>
              <Text style={[styles.title, styles.headingText, { color: colors.foreground }]}>{roadmap.subject}</Text>
            </View>

            <TagList
              items={[
                `${roadmap.startLevel} → ${roadmap.targetLevel}`,
                roadmap.mode === "short" ? "Short" : "Detailed",
                roadmap.personaStyle,
              ].filter((item) => item.trim() !== "")}
            />

            <ProgressBar {...progress} />

            {roadmap.userInstructions ? (
              <Text style={[styles.muted, { color: colors.mutedForeground }]}>
                <Text style={[styles.strong, { color: colors.foreground }]}>Instructions: </Text>
                {roadmap.userInstructions}
              </Text>
            ) : null}

            {roadmap.persona ? (
              <View style={styles.persona}>
                <Pressable
                  onPress={() => setPersonaOpen((open) => !open)}
                  accessibilityRole="button"
                  accessibilityState={{ expanded: personaOpen }}
                  style={styles.personaToggle}
                >
                  <ScrollText size={16} color={colors.mutedForeground} />
                  <Text style={[styles.personaLabel, { color: colors.mutedForeground }]}>AI persona prompt</Text>
                  {personaOpen ? (
                    <ChevronUp size={16} color={colors.mutedForeground} />
                  ) : (
                    <ChevronDown size={16} color={colors.mutedForeground} />
                  )}
                </Pressable>
                {personaOpen ? (
                  <Text style={[styles.personaText, { color: colors.mutedForeground, backgroundColor: colors.muted }]}>
                    {roadmap.persona}
                  </Text>
                ) : null}
              </View>
            ) : null}

            <ErrorText message={error} />
          </Panel>

          <Panel>
            <AddRow
              placeholder="Add a main point manually…"
              label="Add main point"
              maxLength={ROADMAP_LIMITS.title}
              onAdd={(title) => commit((current) => addMainPoint(current, title, makeContext()))}
            />
          </Panel>

          {roadmap.mainPoints.length === 0 ? (
            <Panel>
              <Text style={[styles.title, { color: colors.foreground }]}>No main points yet</Text>
              <Text style={[styles.muted, { color: colors.mutedForeground }]}>
                Add a main point manually, or create a new roadmap to generate them with AI.
              </Text>
            </Panel>
          ) : (
            roadmap.mainPoints.map((point, index) => (
              <MainPointRow
                key={point.id}
                point={point}
                index={index}
                expanded={expandedIds.has(point.id)}
                generating={generatingId === point.id}
                onToggleExpand={() => toggleExpand(point.id)}
                onToggleDone={() => commit((current) => toggleMainPoint(current, point.id, makeContext()))}
                onRename={(title) => commit((current) => renameMainPoint(current, point.id, title, makeContext()))}
                onDelete={() => commit((current) => removeMainPoint(current, point.id, makeContext()))}
                onGenerateSubtopics={() => {
                  if (!generating) void generateForPoint(point.id);
                }}
                onToggleSubtopic={(subtopicId) =>
                  commit((current) => toggleSubtopic(current, point.id, subtopicId, makeContext()))
                }
                onRenameSubtopic={(subtopicId, title) =>
                  commit((current) => renameSubtopic(current, point.id, subtopicId, title, makeContext()))
                }
                onDeleteSubtopic={(subtopicId) =>
                  commit((current) => removeSubtopic(current, point.id, subtopicId, makeContext()))
                }
                onAddSubtopic={(title) =>
                  commit((current) => addSubtopic(current, point.id, title, makeContext()))
                }
              />
            ))
          )}

          <ActionButton label="Delete roadmap" icon={Trash2} variant="outline" onPress={confirmDelete} />
        </Section>
      ) : null}
    </ToolScreen>
  );
}

const styles = StyleSheet.create({
  heading: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
  },
  iconTile: {
    width: 40,
    height: 40,
    borderRadius: radius.lg,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  headingText: {
    flex: 1,
  },
  title: {
    fontSize: 18,
    fontWeight: "600",
  },
  muted: {
    fontSize: 14,
    lineHeight: 21,
  },
  strong: {
    fontWeight: "600",
  },
  persona: {
    gap: spacing.sm,
  },
  personaToggle: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  personaLabel: {
    flex: 1,
    fontSize: 14,
    fontWeight: "500",
  },
  personaText: {
    fontSize: 13,
    lineHeight: 19,
    borderRadius: radius.lg,
    padding: spacing.md,
  },
});

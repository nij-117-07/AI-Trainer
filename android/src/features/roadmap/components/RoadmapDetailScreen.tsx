// src/features/roadmap/components/RoadmapDetailScreen.tsx
/**
 * Roadmap detail body: progress, the next stage to work on, and every stage in order. The add-stage
 * form sits in the footer (see RoadmapDetailFooter).
 */
import { useState } from "react";
import { Alert, Pressable, StyleSheet, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { Check, ChevronDown, ChevronUp, Flag, MapPinned, Plus, ScrollText, Trash2 } from "lucide-react-native";
import { radius, spacing, useThemeColors } from "@/theme";
import { ActionButton, ErrorText, Panel, TextField } from "@/components/tool/FormControls";
import { EmptyHint } from "@/components/tool/EmptyHint";
import { Section } from "@/components/tool/Section";
import { SectionTitle } from "@/components/tool/SectionTitle";
import { TagList } from "@/components/tool/TagList";
import { computeProgress, nextMainPoint, stageStatuses } from "../lib/progress";
import { makeContext } from "../lib/roadmap-store";
import {
  addSubtopic,
  moveMainPoint,
  moveSubtopic,
  removeMainPoint,
  removeSubtopic,
  renameMainPoint,
  renameSubtopic,
  setMilestone,
  toggleMainPoint,
  toggleSubtopic,
} from "../lib/roadmap-ops";
import { ROADMAP_LIMITS } from "../lib/validation";
import type { RoadmapDetailState } from "../hooks/useRoadmapDetail";
import type { Roadmap, RoadmapMainPoint } from "../types";
import { ProgressBar } from "./ProgressBar";
import { MainPointRow } from "./MainPointRow";

const ROADMAP_ROUTE = "/learning/roadmap";

export function RoadmapDetailScreen({ state }: { state: RoadmapDetailState }) {
  const colors = useThemeColors();
  const router = useRouter();
  const { roadmap, loaded, expandedIds, generatingId, commit, setExpanded, generateForPoint } = state;

  if (!loaded) {
    return (
      <Panel>
        <Text style={[styles.muted, { color: colors.mutedForeground }]}>Loading roadmap…</Text>
      </Panel>
    );
  }

  if (!roadmap) {
    return (
      <Panel>
        <Text style={[styles.title, { color: colors.foreground }]}>Roadmap not found</Text>
        <Text style={[styles.muted, { color: colors.mutedForeground }]}>
          It may have been deleted. Go back to your roadmaps to pick another one.
        </Text>
        <ActionButton label="Back to roadmaps" variant="outline" onPress={() => router.replace(ROADMAP_ROUTE)} />
      </Panel>
    );
  }

  const progress = computeProgress(roadmap);
  const statuses = stageStatuses(roadmap.mainPoints);
  const next = nextMainPoint(roadmap);
  const nextIndex = next ? roadmap.mainPoints.findIndex((point) => point.id === next.id) : -1;
  const generating = generatingId !== null;

  function confirmDelete() {
    Alert.alert(
      "Delete this roadmap?",
      `"${roadmap?.subject}" and all of its main points and subpoints will be permanently removed.`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => {
            void state.deleteCurrent().then((removed) => {
              if (removed) router.replace(ROADMAP_ROUTE);
            });
          },
        },
      ],
    );
  }

  return (
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
          ].filter((item) => item.trim() !== "")}
        />

        <ProgressBar {...progress} />
      </Panel>

      {next && nextIndex >= 0 ? (
        <NextUpCard
          point={next}
          index={nextIndex}
          onMarkDone={() => commit((current) => toggleMainPoint(current, next.id, makeContext()))}
        />
      ) : roadmap.mainPoints.length > 0 ? (
        <Panel>
          <SectionTitle icon={Check} title="All stages done" />
          <Text style={[styles.muted, { color: colors.mutedForeground }]}>
            You have finished every main point. Add a stage in the form to keep going.
          </Text>
        </Panel>
      ) : null}

      <View style={styles.stages}>
        <SectionTitle icon={Flag} title="Stages" />
        {roadmap.mainPoints.length === 0 ? (
          <EmptyHint
            icon={Flag}
            title="No stages yet"
            hint="Add your first stage in the form."
          />
        ) : (
          roadmap.mainPoints.map((point, index) => (
            <MainPointRow
              key={point.id}
              point={point}
              index={index}
              isFirst={index === 0}
              isLast={index === roadmap.mainPoints.length - 1}
              status={statuses[index]}
              expanded={expandedIds.has(point.id)}
              generating={generatingId === point.id}
              onToggleExpand={() => setExpanded(point.id, !expandedIds.has(point.id))}
              onToggleDone={() => commit((current) => toggleMainPoint(current, point.id, makeContext()))}
              onRename={(title) => commit((current) => renameMainPoint(current, point.id, title, makeContext()))}
              onSetMilestone={(milestone) => commit((current) => setMilestone(current, point.id, milestone, makeContext()))}
              onMove={(direction) => commit((current) => moveMainPoint(current, point.id, direction, makeContext()))}
              onDelete={() => commit((current) => removeMainPoint(current, point.id, makeContext()))}
              onGenerateSubtopics={(instructions) => {
                if (!generating) void state.generateForPoint(point.id, instructions);
              }}
              onToggleSubtopic={(subtopicId) =>
                commit((current) => toggleSubtopic(current, point.id, subtopicId, makeContext()))
              }
              onRenameSubtopic={(subtopicId, title) =>
                commit((current) => renameSubtopic(current, point.id, subtopicId, title, makeContext()))
              }
              onMoveSubtopic={(subtopicId, direction) =>
                commit((current) => moveSubtopic(current, point.id, subtopicId, direction, makeContext()))
              }
              onDeleteSubtopic={(subtopicId) =>
                commit((current) => removeSubtopic(current, point.id, subtopicId, makeContext()))
              }
              onAddSubtopic={(title) => commit((current) => addSubtopic(current, point.id, title, makeContext()))}
            />
          ))
        )}
      </View>

      <AboutRoadmap roadmap={roadmap} />

      <ActionButton label="Delete roadmap" icon={Trash2} variant="outline" onPress={confirmDelete} />
    </Section>
  );
}

function NextUpCard({
  point,
  index,
  onMarkDone,
}: {
  point: RoadmapMainPoint;
  index: number;
  onMarkDone: () => void;
}) {
  const colors = useThemeColors();
  return (
    <Panel>
      <SectionTitle icon={Flag} title="Next up" />
      <Text style={[styles.nextTitle, { color: colors.foreground }]}>
        Stage {index + 1}: {point.title}
      </Text>
      {point.milestone ? (
        <Text style={[styles.muted, { color: colors.mutedForeground }]}>Milestone: {point.milestone}</Text>
      ) : null}
      <ActionButton label="Mark as done" icon={Check} onPress={onMarkDone} />
    </Panel>
  );
}

function AboutRoadmap({ roadmap }: { roadmap: Roadmap }) {
  const colors = useThemeColors();
  const [open, setOpen] = useState(false);
  const hasDetails = roadmap.userInstructions.trim() !== "" || roadmap.persona.trim() !== "";
  if (!hasDetails) return null;

  return (
    <Panel>
      <Pressable
        onPress={() => setOpen((value) => !value)}
        accessibilityRole="button"
        accessibilityState={{ expanded: open }}
        style={styles.aboutToggle}
      >
        <ScrollText size={16} color={colors.mutedForeground} />
        <Text style={[styles.aboutLabel, { color: colors.foreground }]}>About this roadmap</Text>
        {open ? (
          <ChevronUp size={18} color={colors.mutedForeground} />
        ) : (
          <ChevronDown size={18} color={colors.mutedForeground} />
        )}
      </Pressable>

      {open ? (
        <View style={styles.aboutBody}>
          {roadmap.userInstructions.trim() !== "" ? (
            <Text style={[styles.muted, { color: colors.mutedForeground }]}>
              <Text style={[styles.strong, { color: colors.foreground }]}>Instructions: </Text>
              {roadmap.userInstructions}
            </Text>
          ) : null}
          {roadmap.persona.trim() !== "" ? (
            <Text style={[styles.persona, { color: colors.mutedForeground, backgroundColor: colors.muted }]}>
              {roadmap.persona}
            </Text>
          ) : null}
        </View>
      ) : null}
    </Panel>
  );
}

/** Footer form for adding a stage to the open roadmap. */
export function RoadmapDetailFooter({ state }: { state: RoadmapDetailState }) {
  const [title, setTitle] = useState("");
  const trimmed = title.trim();
  const busy = state.generatingId !== null;

  function submit() {
    if (!trimmed) return;
    state.addStage(trimmed);
    setTitle("");
  }

  return (
    <View style={styles.footer}>
      <TextField
        label="Add a stage"
        placeholder="e.g. Information architecture"
        value={title}
        onChangeText={setTitle}
        editable={!busy}
        maxLength={ROADMAP_LIMITS.title}
      />
      <ErrorText message={state.error} />
      <ActionButton label="Add stage" icon={Plus} disabled={!trimmed || busy} onPress={submit} />
    </View>
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
  nextTitle: {
    fontSize: 16,
    fontWeight: "600",
  },
  muted: {
    fontSize: 14,
    lineHeight: 21,
  },
  strong: {
    fontWeight: "600",
  },
  stages: {
    gap: spacing.md,
  },
  aboutToggle: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  aboutLabel: {
    flex: 1,
    fontSize: 14,
    fontWeight: "500",
  },
  aboutBody: {
    gap: spacing.sm,
  },
  persona: {
    fontSize: 13,
    lineHeight: 19,
    borderRadius: radius.lg,
    padding: spacing.md,
  },
  footer: {
    gap: spacing.md,
  },
});

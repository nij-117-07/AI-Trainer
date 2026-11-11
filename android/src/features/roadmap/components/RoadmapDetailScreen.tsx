// src/features/roadmap/components/RoadmapDetailScreen.tsx
/**
 * Roadmap detail body: progress, the next stage to work on, every stage in order, and the add-stage
 * row at the end. Delete is in the top bar (see RoadmapDeleteAction).
 */
import { StyleSheet, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { Flag, ScrollText, Trash2 } from "lucide-react-native";
import { spacing, typeScale, useThemeColors } from "@/theme";
import { ActionButton, ErrorText, Panel } from "@/components/tool/FormControls";
import { Disclosure } from "@/components/tool/Disclosure";
import { EmptyHint } from "@/components/tool/EmptyHint";
import { Section } from "@/components/tool/Section";
import { SectionTitle } from "@/components/tool/SectionTitle";
import { TagList } from "@/components/tool/TagList";
import { UndoSnackbar } from "@/components/tool/UndoSnackbar";
import { computeProgress, nextMainPoint, stageStatuses } from "../lib/progress";
import {
  addSubtopic,
  moveMainPoint,
  moveSubtopic,
  renameMainPoint,
  renameSubtopic,
  setMilestone,
  toggleMainPoint,
  toggleSubtopic,
} from "../lib/roadmap-ops";
import { makeContext } from "../lib/roadmap-store";
import { ROADMAP_LIMITS } from "../lib/validation";
import type { RoadmapDetailState } from "../hooks/useRoadmapDetail";
import type { Roadmap } from "../types";
import { AddRow } from "./ItemControls";
import { HeaderAction } from "./HeaderAction";
import { MainPointRow } from "./MainPointRow";
import { ProgressBar } from "./ProgressBar";

const ROADMAP_ROUTE = "/learning/roadmap";

export function RoadmapDetailScreen({ state }: { state: RoadmapDetailState }) {
  const colors = useThemeColors();
  const router = useRouter();
  const { roadmap, loaded, expandedIds, generatingId, commit, setExpanded, generateForPoint, pending } = state;

  if (!loaded) {
    return (
      <Panel>
        <Text style={[styles.muted, { color: colors.mutedForeground }]}>Loading roadmap…</Text>
      </Panel>
    );
  }

  if (pending?.kind === "roadmap") {
    return (
      <Section>
        <UndoSnackbar message={pending.message} onUndo={state.undo} onDismiss={state.dismiss} />
      </Section>
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

  return (
    <Section>
      <ErrorText message={state.error} />

      <Panel>
        <TagList
          items={[
            `${roadmap.startLevel} → ${roadmap.targetLevel}`,
            roadmap.mode === "short" ? "Short" : "Detailed",
          ].filter((item) => item.trim() !== "")}
        />

        <ProgressBar {...progress} />

        {next && nextIndex >= 0 ? (
          <Text style={[styles.next, { color: colors.foreground }]}>
            Next up: Stage {nextIndex + 1}: {next.title}
          </Text>
        ) : roadmap.mainPoints.length > 0 ? (
          <Text style={[styles.next, { color: colors.foreground }]}>All stages done</Text>
        ) : null}
      </Panel>

      <View style={styles.stages}>
        <SectionTitle icon={Flag} title="Stages" />
        {roadmap.mainPoints.length === 0 ? (
          <EmptyHint icon={Flag} title="No stages yet" hint="Add your first stage to start the roadmap." />
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
              onDelete={() => state.removeStage(point.id)}
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
              onDeleteSubtopic={(subtopicId) => state.removeSubpoint(point.id, subtopicId)}
              onAddSubtopic={(title) => commit((current) => addSubtopic(current, point.id, title, makeContext()))}
            />
          ))
        )}
        <AddRow
          placeholder="Add a stage…"
          label="Add stage"
          maxLength={ROADMAP_LIMITS.title}
          disabled={generating}
          onAdd={state.addStage}
        />
      </View>

      <AboutRoadmap roadmap={roadmap} />

      {pending ? <UndoSnackbar message={pending.message} onUndo={state.undo} onDismiss={state.dismiss} /> : null}
    </Section>
  );
}

export function RoadmapDeleteAction({ state }: { state: RoadmapDetailState }) {
  const router = useRouter();
  const subject = state.roadmap?.subject;
  if (subject === undefined || state.pending?.kind === "roadmap") return null;

  return (
    <HeaderAction
      icon={Trash2}
      label={`Delete roadmap ${subject}`}
      destructive
      onPress={() => state.removeRoadmap(() => router.replace(ROADMAP_ROUTE))}
    />
  );
}

function AboutRoadmap({ roadmap }: { roadmap: Roadmap }) {
  const colors = useThemeColors();
  const hasInstructions = roadmap.userInstructions.trim() !== "";
  const hasPersona = roadmap.persona.trim() !== "";
  if (!hasInstructions && !hasPersona) return null;

  return (
    <Disclosure title="About this roadmap" icon={ScrollText}>
      {hasInstructions ? (
        <Text style={[styles.muted, { color: colors.mutedForeground }]}>
          <Text style={[styles.strong, { color: colors.foreground }]}>Instructions: </Text>
          {roadmap.userInstructions}
        </Text>
      ) : null}
      {hasPersona ? <Text style={[styles.muted, { color: colors.mutedForeground }]}>{roadmap.persona}</Text> : null}
    </Disclosure>
  );
}

const styles = StyleSheet.create({
  title: {
    ...typeScale.title,
  },
  muted: {
    ...typeScale.body,
  },
  strong: {
    fontWeight: "600",
  },
  next: {
    ...typeScale.body,
    fontWeight: "600",
  },
  stages: {
    gap: spacing.md,
  },
});

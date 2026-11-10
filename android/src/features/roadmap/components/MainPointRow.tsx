// src/features/roadmap/components/MainPointRow.tsx
/**
 * One stage of the roadmap. Tap the title to open it: the milestone, the subpoints, AI generation,
 * and rename, move, or delete. Status is shown as a word as well as a colour.
 */
import { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { Check, ChevronDown, ChevronRight, ChevronUp, Flag, Pencil, Sparkles, Trash2 } from "lucide-react-native";
import { radius, spacing, useThemeColors } from "@/theme";
import { ActionButton, TextField } from "@/components/tool/FormControls";
import { ListenButton } from "@/components/tool/ListenButton";
import { ResultCallout } from "@/components/tool/ResultCallout";
import { ROADMAP_LIMITS } from "../lib/validation";
import type { StageStatus } from "../lib/progress";
import type { RoadmapMainPoint } from "../types";
import { AddRow, DoneToggle, InlineEdit } from "./ItemControls";
import { SubtopicRow } from "./SubtopicRow";

const STATUS_LABEL: Record<StageStatus, string> = {
  done: "Done",
  current: "Current",
  upcoming: "Upcoming",
};

interface MainPointRowProps {
  point: RoadmapMainPoint;
  index: number;
  isFirst: boolean;
  isLast: boolean;
  status: StageStatus;
  expanded: boolean;
  generating: boolean;
  onToggleExpand: () => void;
  onToggleDone: () => void;
  onRename: (title: string) => void;
  onSetMilestone: (milestone: string) => void;
  onMove: (direction: -1 | 1) => void;
  onDelete: () => void;
  onGenerateSubtopics: (instructions?: string) => void;
  onToggleSubtopic: (subtopicId: string) => void;
  onRenameSubtopic: (subtopicId: string, title: string) => void;
  onMoveSubtopic: (subtopicId: string, direction: -1 | 1) => void;
  onDeleteSubtopic: (subtopicId: string) => void;
  onAddSubtopic: (title: string) => void;
}

export function MainPointRow({
  point,
  index,
  isFirst,
  isLast,
  status,
  expanded,
  generating,
  onToggleExpand,
  onToggleDone,
  onRename,
  onSetMilestone,
  onMove,
  onDelete,
  onGenerateSubtopics,
  onToggleSubtopic,
  onRenameSubtopic,
  onMoveSubtopic,
  onDeleteSubtopic,
  onAddSubtopic,
}: MainPointRowProps) {
  const colors = useThemeColors();
  const [editing, setEditing] = useState(false);
  const [editingMilestone, setEditingMilestone] = useState(false);
  const [milestoneDraft, setMilestoneDraft] = useState("");
  const [askingSubtopics, setAskingSubtopics] = useState(false);
  const [customizing, setCustomizing] = useState(false);
  const [instructionDraft, setInstructionDraft] = useState("");
  const subtopicCount = point.subtopics.length;

  function closeSubtopicPrompt() {
    setAskingSubtopics(false);
    setCustomizing(false);
    setInstructionDraft("");
  }

  function generateSubtopics(instructions?: string) {
    closeSubtopicPrompt();
    onGenerateSubtopics(instructions);
  }
  const isCurrent = status === "current";

  return (
    <View
      style={[
        styles.card,
        { backgroundColor: colors.card, borderColor: isCurrent ? colors.primary : colors.border },
      ]}
    >
      <View style={styles.header}>
        <DoneToggle done={point.done} label={`Mark "${point.title}" done`} onToggle={onToggleDone} />

        {editing ? (
          <View style={styles.flex}>
            <InlineEdit
              initialValue={point.title}
              maxLength={ROADMAP_LIMITS.title}
              onSave={(title) => {
                onRename(title);
                setEditing(false);
              }}
              onCancel={() => setEditing(false)}
            />
          </View>
        ) : (
          <Pressable
            onPress={onToggleExpand}
            accessibilityRole="button"
            accessibilityState={{ expanded }}
            accessibilityLabel={`${expanded ? "Collapse" : "Expand"} ${point.title}`}
            style={styles.titleArea}
          >
            <View style={styles.titleText}>
              <Text style={[styles.stage, { color: isCurrent ? colors.primary : colors.mutedForeground }]}>
                Stage {index + 1} · {STATUS_LABEL[status]}
              </Text>
              <Text
                numberOfLines={2}
                style={[
                  styles.title,
                  { color: point.done ? colors.mutedForeground : colors.foreground },
                  point.done && styles.done,
                ]}
              >
                {point.title}
              </Text>
              {subtopicCount > 0 ? (
                <Text style={[styles.count, { color: colors.mutedForeground }]}>
                  {subtopicCount} sub{subtopicCount === 1 ? "" : "s"}
                </Text>
              ) : null}
            </View>
            {expanded ? (
              <ChevronDown size={18} color={colors.mutedForeground} />
            ) : (
              <ChevronRight size={18} color={colors.mutedForeground} />
            )}
          </Pressable>
        )}
      </View>

      {expanded ? (
        <View style={[styles.body, { borderTopColor: colors.border }]}>
          {editingMilestone ? (
            <View style={styles.milestoneEditor}>
              <TextField
                label="Milestone"
                placeholder="e.g. Build a small project that uses traits"
                value={milestoneDraft}
                onChangeText={setMilestoneDraft}
                maxLength={ROADMAP_LIMITS.milestone}
                multiline
                voice
              />
              <ActionButton
                label="Save milestone"
                icon={Check}
                onPress={() => {
                  onSetMilestone(milestoneDraft.trim());
                  setEditingMilestone(false);
                }}
              />
              <ActionButton label="Cancel" variant="outline" onPress={() => setEditingMilestone(false)} />
            </View>
          ) : (
            <>
              {point.milestone ? (
                <ResultCallout icon={Flag} title="Milestone" tone="sky">
                  <Text style={[styles.milestone, { color: colors.foreground }]}>{point.milestone}</Text>
                  <ListenButton text={point.milestone} label="Milestone" />
                </ResultCallout>
              ) : null}
              <ActionButton
                label={point.milestone ? "Edit milestone" : "Add milestone"}
                icon={Pencil}
                variant="outline"
                onPress={() => {
                  setMilestoneDraft(point.milestone);
                  setEditingMilestone(true);
                }}
              />
            </>
          )}

          {subtopicCount > 0 ? (
            <View style={styles.subtopics}>
              {point.subtopics.map((subtopic, subIndex) => (
                <SubtopicRow
                  key={subtopic.id}
                  subtopic={subtopic}
                  isFirst={subIndex === 0}
                  isLast={subIndex === subtopicCount - 1}
                  onToggle={() => onToggleSubtopic(subtopic.id)}
                  onRename={(title) => onRenameSubtopic(subtopic.id, title)}
                  onMove={(direction) => onMoveSubtopic(subtopic.id, direction)}
                  onDelete={() => onDeleteSubtopic(subtopic.id)}
                />
              ))}
            </View>
          ) : null}

          {askingSubtopics ? (
            <View style={[styles.prompt, { backgroundColor: colors.muted }]}>
              <Text style={[styles.promptText, { color: colors.mutedForeground }]}>
                {subtopicCount > 0
                  ? `This replaces the ${subtopicCount} current subpoint${subtopicCount === 1 ? "" : "s"}. The AI sees them, so it avoids repeats.`
                  : "The AI will write subpoints for this stage."}
              </Text>
              {customizing ? (
                <>
                  <TextField
                    label="Your instructions"
                    placeholder="e.g. Focus on hands-on practice, skip theory"
                    value={instructionDraft}
                    onChangeText={setInstructionDraft}
                    maxLength={ROADMAP_LIMITS.instructions}
                    multiline
                    voice
                  />
                  <ActionButton
                    label="Generate"
                    icon={Sparkles}
                    onPress={() => generateSubtopics(instructionDraft.trim() || undefined)}
                  />
                  <ActionButton label="Cancel" variant="outline" onPress={closeSubtopicPrompt} />
                </>
              ) : (
                <>
                  <Text style={[styles.promptQuestion, { color: colors.foreground }]}>Customize it first?</Text>
                  <ActionButton label="No, generate" icon={Sparkles} onPress={() => generateSubtopics()} />
                  <ActionButton label="Yes, customize" variant="outline" onPress={() => setCustomizing(true)} />
                  <ActionButton label="Cancel" variant="outline" onPress={closeSubtopicPrompt} />
                </>
              )}
            </View>
          ) : (
            <ActionButton
              label={subtopicCount > 0 ? "Regenerate subpoints" : "Generate subpoints"}
              icon={Sparkles}
              variant="outline"
              loading={generating}
              onPress={() => setAskingSubtopics(true)}
            />
          )}

          <AddRow
            placeholder="Add a subpoint…"
            label="Add subpoint"
            maxLength={ROADMAP_LIMITS.title}
            onAdd={onAddSubtopic}
          />

          <View style={styles.actions}>
            <View style={styles.flex}>
              <ActionButton label="Rename" icon={Pencil} variant="outline" onPress={() => setEditing(true)} />
            </View>
            <View style={styles.flex}>
              <ActionButton label="Delete stage" icon={Trash2} variant="outline" onPress={onDelete} />
            </View>
          </View>
          <View style={styles.actions}>
            <View style={styles.flex}>
              <ActionButton
                label="Move up"
                icon={ChevronUp}
                variant="outline"
                disabled={isFirst}
                onPress={() => onMove(-1)}
              />
            </View>
            <View style={styles.flex}>
              <ActionButton
                label="Move down"
                icon={ChevronDown}
                variant="outline"
                disabled={isLast}
                onPress={() => onMove(1)}
              />
            </View>
          </View>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
    borderRadius: radius.xl,
    overflow: "hidden",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
  },
  flex: {
    flex: 1,
  },
  titleArea: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  titleText: {
    flex: 1,
    gap: 2,
  },
  stage: {
    fontSize: 12,
    fontWeight: "600",
  },
  title: {
    fontSize: 15,
    fontWeight: "600",
  },
  done: {
    textDecorationLine: "line-through",
  },
  count: {
    fontSize: 12,
  },
  body: {
    borderTopWidth: 1,
    padding: spacing.lg,
    gap: spacing.md,
  },
  milestone: {
    fontSize: 14,
    lineHeight: 20,
  },
  milestoneEditor: {
    gap: spacing.sm,
  },
  prompt: {
    borderRadius: radius.lg,
    padding: spacing.md,
    gap: spacing.sm,
  },
  promptText: {
    fontSize: 13,
    lineHeight: 19,
  },
  promptQuestion: {
    fontSize: 14,
    fontWeight: "600",
  },
  subtopics: {
    gap: spacing.xs,
  },
  actions: {
    flexDirection: "row",
    gap: spacing.sm,
  },
});

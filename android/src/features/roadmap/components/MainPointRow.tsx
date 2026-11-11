// src/features/roadmap/components/MainPointRow.tsx
/**
 * One stage of the roadmap. Tap the title to open it: the milestone, the subpoints, AI generation,
 * and rename, move, or delete. Status is shown as a word as well as a colour.
 */
import { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { Check, ChevronDown, ChevronRight, ChevronUp, Pencil, Sparkles, Trash2, X } from "lucide-react-native";
import { shape, spacing, typeScale, useThemeColors } from "@/theme";
import { ActionButton, TextField } from "@/components/tool/FormControls";
import { ListenButton } from "@/components/tool/ListenButton";
import { ROADMAP_LIMITS } from "../lib/validation";
import type { StageStatus } from "../lib/progress";
import type { RoadmapMainPoint } from "../types";
import { AddRow, DoneToggle, IconButton, InlineEdit } from "./ItemControls";
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
  const isCurrent = status === "current";
  const generateLabel = subtopicCount > 0 ? "Regenerate subpoints" : "Generate subpoints";

  function closeSubtopicPrompt() {
    setAskingSubtopics(false);
    setCustomizing(false);
    setInstructionDraft("");
  }

  function generateSubtopics(instructions?: string) {
    closeSubtopicPrompt();
    onGenerateSubtopics(instructions);
  }

  return (
    <View
      style={[
        styles.card,
        { backgroundColor: colors.card, borderColor: isCurrent ? colors.primary : colors.border },
      ]}
    >
      <View style={styles.header}>
        <DoneToggle done={point.done} title={point.title} onToggle={onToggleDone} />

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
              <ChevronDown size={20} color={colors.mutedForeground} />
            ) : (
              <ChevronRight size={20} color={colors.mutedForeground} />
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
              <View style={styles.row}>
                <View style={styles.flex}>
                  <ActionButton
                    label="Save milestone"
                    icon={Check}
                    onPress={() => {
                      onSetMilestone(milestoneDraft.trim());
                      setEditingMilestone(false);
                    }}
                  />
                </View>
                <IconButton icon={X} label="Cancel milestone edit" onPress={() => setEditingMilestone(false)} />
              </View>
            </View>
          ) : (
            <View style={styles.row}>
              <View style={styles.flex}>
                <Text style={[styles.caption, { color: colors.mutedForeground }]}>Milestone</Text>
                <Text style={[styles.milestone, { color: point.milestone ? colors.foreground : colors.mutedForeground }]}>
                  {point.milestone || "No milestone yet"}
                </Text>
              </View>
              {point.milestone ? <ListenButton text={point.milestone} label="Milestone" /> : null}
              <IconButton
                icon={Pencil}
                label={point.milestone ? "Edit milestone" : "Add milestone"}
                onPress={() => {
                  setMilestoneDraft(point.milestone);
                  setEditingMilestone(true);
                }}
              />
            </View>
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
              <View style={styles.row}>
                <Text style={[styles.promptText, styles.flex, { color: colors.mutedForeground }]}>
                  {subtopicCount > 0
                    ? `This replaces the ${subtopicCount} current subpoint${subtopicCount === 1 ? "" : "s"}.`
                    : "The AI will write subpoints for this stage."}
                </Text>
                <IconButton icon={X} label="Cancel subpoint generation" onPress={closeSubtopicPrompt} />
              </View>
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
                    label={generateLabel}
                    icon={Sparkles}
                    onPress={() => generateSubtopics(instructionDraft.trim() || undefined)}
                  />
                </>
              ) : (
                <>
                  <ActionButton label={generateLabel} icon={Sparkles} onPress={() => generateSubtopics()} />
                  <ActionButton label="Customize first" variant="outline" onPress={() => setCustomizing(true)} />
                </>
              )}
            </View>
          ) : (
            <ActionButton
              label={generateLabel}
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
            <IconButton icon={Pencil} label="Rename stage" onPress={() => setEditing(true)} />
            <IconButton icon={Trash2} label={`Delete stage ${point.title}`} onPress={onDelete} />
            <IconButton icon={ChevronUp} label="Move stage up" disabled={isFirst} onPress={() => onMove(-1)} />
            <IconButton icon={ChevronDown} label="Move stage down" disabled={isLast} onPress={() => onMove(1)} />
          </View>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
    borderRadius: shape.lg,
    overflow: "hidden",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    paddingLeft: spacing.xs,
    paddingRight: spacing.md,
    paddingVertical: spacing.xs,
  },
  flex: {
    flex: 1,
  },
  titleArea: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    minHeight: 48,
    paddingVertical: spacing.xs,
  },
  titleText: {
    flex: 1,
    gap: 2,
  },
  stage: {
    ...typeScale.caption,
    fontWeight: "600",
  },
  title: {
    ...typeScale.body,
    fontWeight: "600",
  },
  done: {
    textDecorationLine: "line-through",
  },
  count: {
    ...typeScale.caption,
  },
  body: {
    borderTopWidth: 1,
    padding: spacing.lg,
    gap: spacing.md,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  caption: {
    ...typeScale.caption,
  },
  milestone: {
    ...typeScale.body,
  },
  milestoneEditor: {
    gap: spacing.sm,
  },
  prompt: {
    borderRadius: shape.lg,
    padding: spacing.md,
    gap: spacing.sm,
  },
  promptText: {
    ...typeScale.body,
  },
  subtopics: {
    gap: spacing.sm,
  },
  actions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: spacing.xs,
  },
});

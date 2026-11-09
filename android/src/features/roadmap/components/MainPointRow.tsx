// src/features/roadmap/components/MainPointRow.tsx
/**
 * A main point row. Expanding it reveals the milestone and subpoints, plus AI "generate subpoints"
 * and manual add.
 */
import { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { ChevronDown, ChevronRight, Flag, Pencil, Sparkles, Trash2 } from "lucide-react-native";
import { radius, spacing, useThemeColors } from "@/theme";
import { ActionButton } from "@/components/tool/FormControls";
import { ListenButton } from "@/components/tool/ListenButton";
import { ResultCallout } from "@/components/tool/ResultCallout";
import { ROADMAP_LIMITS } from "../lib/validation";
import type { RoadmapMainPoint } from "../types";
import { AddRow, DoneToggle, IconButton, InlineEdit } from "./ItemControls";
import { SubtopicRow } from "./SubtopicRow";

interface MainPointRowProps {
  point: RoadmapMainPoint;
  index: number;
  expanded: boolean;
  generating: boolean;
  onToggleExpand: () => void;
  onToggleDone: () => void;
  onRename: (title: string) => void;
  onDelete: () => void;
  onGenerateSubtopics: () => void;
  onToggleSubtopic: (subtopicId: string) => void;
  onRenameSubtopic: (subtopicId: string, title: string) => void;
  onDeleteSubtopic: (subtopicId: string) => void;
  onAddSubtopic: (title: string) => void;
}

export function MainPointRow({
  point,
  index,
  expanded,
  generating,
  onToggleExpand,
  onToggleDone,
  onRename,
  onDelete,
  onGenerateSubtopics,
  onToggleSubtopic,
  onRenameSubtopic,
  onDeleteSubtopic,
  onAddSubtopic,
}: MainPointRowProps) {
  const colors = useThemeColors();
  const [editing, setEditing] = useState(false);
  const subtopicCount = point.subtopics.length;

  return (
    <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <View style={styles.header}>
        <IconButton
          icon={expanded ? ChevronDown : ChevronRight}
          label={expanded ? "Collapse main point" : "Expand main point"}
          onPress={onToggleExpand}
        />
        <DoneToggle done={point.done} label={`Mark "${point.title}" done`} onToggle={onToggleDone} />
        {editing ? (
          <InlineEdit
            initialValue={point.title}
            maxLength={ROADMAP_LIMITS.title}
            onSave={(title) => {
              onRename(title);
              setEditing(false);
            }}
            onCancel={() => setEditing(false)}
          />
        ) : (
          <>
            <Pressable
              onPress={onToggleExpand}
              accessibilityRole="button"
              accessibilityLabel={`${expanded ? "Collapse" : "Expand"} ${point.title}`}
              style={styles.titleArea}
            >
              <View style={[styles.badge, { backgroundColor: colors.tone.sky.bg }]}>
                <Text style={[styles.badgeText, { color: colors.primary }]}>{index + 1}</Text>
              </View>
              <View style={styles.titleText}>
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
            </Pressable>
            <IconButton icon={Pencil} label="Rename main point" onPress={() => setEditing(true)} />
            <IconButton icon={Trash2} label="Delete main point" onPress={onDelete} />
          </>
        )}
      </View>

      {expanded ? (
        <View style={[styles.body, { borderTopColor: colors.border }]}>
          {point.milestone ? (
            <ResultCallout icon={Flag} title="Milestone" tone="sky">
              <Text style={[styles.milestone, { color: colors.foreground }]}>{point.milestone}</Text>
              <ListenButton text={point.milestone} label="Milestone" />
            </ResultCallout>
          ) : null}

          {subtopicCount > 0 ? (
            <View style={styles.subtopics}>
              {point.subtopics.map((subtopic) => (
                <SubtopicRow
                  key={subtopic.id}
                  subtopic={subtopic}
                  onToggle={() => onToggleSubtopic(subtopic.id)}
                  onRename={(title) => onRenameSubtopic(subtopic.id, title)}
                  onDelete={() => onDeleteSubtopic(subtopic.id)}
                />
              ))}
            </View>
          ) : null}

          <ActionButton
            label={subtopicCount > 0 ? "Regenerate subpoints" : "Generate subpoints"}
            icon={Sparkles}
            variant="outline"
            loading={generating}
            onPress={onGenerateSubtopics}
          />

          <AddRow
            placeholder="Add a subpoint manually…"
            label="Add subpoint"
            maxLength={ROADMAP_LIMITS.title}
            onAdd={onAddSubtopic}
          />
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
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.md,
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
  badge: {
    width: 26,
    height: 26,
    borderRadius: radius.md,
    alignItems: "center",
    justifyContent: "center",
  },
  badgeText: {
    fontSize: 12,
    fontWeight: "700",
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
  subtopics: {
    gap: spacing.xs,
  },
});

// src/features/roadmap/components/SubtopicRow.tsx
/** A single subpoint: done button and title, with move, rename, and delete icons under it. */
import { useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { ChevronDown, ChevronUp, Pencil, Trash2 } from "lucide-react-native";
import { spacing, typeScale, useThemeColors } from "@/theme";
import { ROADMAP_LIMITS } from "../lib/validation";
import type { RoadmapSubtopic } from "../types";
import { DoneToggle, IconButton, InlineEdit } from "./ItemControls";

interface SubtopicRowProps {
  subtopic: RoadmapSubtopic;
  isFirst: boolean;
  isLast: boolean;
  onToggle: () => void;
  onRename: (title: string) => void;
  onMove: (direction: -1 | 1) => void;
  onDelete: () => void;
}

export function SubtopicRow({ subtopic, isFirst, isLast, onToggle, onRename, onMove, onDelete }: SubtopicRowProps) {
  const colors = useThemeColors();
  const [editing, setEditing] = useState(false);

  return (
    <View style={styles.wrap}>
      <View style={styles.row}>
        <DoneToggle done={subtopic.done} title={subtopic.title} onToggle={onToggle} />
        {editing ? (
          <InlineEdit
            initialValue={subtopic.title}
            maxLength={ROADMAP_LIMITS.title}
            onSave={(title) => {
              onRename(title);
              setEditing(false);
            }}
            onCancel={() => setEditing(false)}
          />
        ) : (
          <Text
            style={[
              styles.title,
              { color: subtopic.done ? colors.mutedForeground : colors.foreground },
              subtopic.done && styles.done,
            ]}
          >
            {subtopic.title}
          </Text>
        )}
      </View>
      {editing ? null : (
        <View style={styles.actions}>
          <IconButton
            icon={ChevronUp}
            label={`Move "${subtopic.title}" up`}
            disabled={isFirst}
            onPress={() => onMove(-1)}
          />
          <IconButton
            icon={ChevronDown}
            label={`Move "${subtopic.title}" down`}
            disabled={isLast}
            onPress={() => onMove(1)}
          />
          <IconButton icon={Pencil} label={`Rename "${subtopic.title}"`} onPress={() => setEditing(true)} />
          <IconButton icon={Trash2} label={`Delete "${subtopic.title}"`} onPress={onDelete} />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    gap: spacing.xs,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
  },
  title: {
    flex: 1,
    ...typeScale.body,
  },
  done: {
    textDecorationLine: "line-through",
  },
  actions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: spacing.xs,
  },
});

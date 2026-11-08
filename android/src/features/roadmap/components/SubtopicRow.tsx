// src/features/roadmap/components/SubtopicRow.tsx
/** A single subpoint: done toggle, title, inline rename, and delete. */
import { useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { Pencil, Trash2 } from "lucide-react-native";
import { spacing, useThemeColors } from "@/theme";
import { ROADMAP_LIMITS } from "../lib/validation";
import type { RoadmapSubtopic } from "../types";
import { DoneToggle, IconButton, InlineEdit } from "./ItemControls";

interface SubtopicRowProps {
  subtopic: RoadmapSubtopic;
  onToggle: () => void;
  onRename: (title: string) => void;
  onDelete: () => void;
}

export function SubtopicRow({ subtopic, onToggle, onRename, onDelete }: SubtopicRowProps) {
  const colors = useThemeColors();
  const [editing, setEditing] = useState(false);

  return (
    <View style={styles.row}>
      <DoneToggle done={subtopic.done} label={`Mark "${subtopic.title}" done`} onToggle={onToggle} />
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
        <>
          <Text
            style={[
              styles.title,
              { color: subtopic.done ? colors.mutedForeground : colors.foreground },
              subtopic.done && styles.done,
            ]}
          >
            {subtopic.title}
          </Text>
          <IconButton icon={Pencil} label="Rename subtopic" onPress={() => setEditing(true)} />
          <IconButton icon={Trash2} label="Delete subtopic" onPress={onDelete} />
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    paddingVertical: spacing.xs,
  },
  title: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
  },
  done: {
    textDecorationLine: "line-through",
  },
});

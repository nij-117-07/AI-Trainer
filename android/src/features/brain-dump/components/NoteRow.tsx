// src/features/brain-dump/components/NoteRow.tsx
/** One note in the list. Tap to open it, or tap the pin to keep it at the top. */
import { Pressable, StyleSheet, Text, View } from "react-native";
import { Pin } from "lucide-react-native";
import { shape, spacing, typeScale, useThemeColors } from "@/theme";
import type { Note } from "../types";
import { displayTitle, formatUpdated, noteTags } from "../lib/notes";
import { IconAction } from "./IconAction";

interface NoteRowProps {
  note: Note;
  onOpen: () => void;
  onTogglePin: () => void;
}

export function NoteRow({ note, onOpen, onTogglePin }: NoteRowProps) {
  const colors = useThemeColors();
  const title = displayTitle(note);
  const meta = [note.pinned ? "Pinned" : null, formatUpdated(note.updatedAt), ...noteTags(note).map((tag) => `#${tag}`)]
    .filter(Boolean)
    .join(" · ");

  return (
    <Pressable
      onPress={onOpen}
      accessibilityRole="button"
      accessibilityLabel={`Open note ${title}`}
      style={({ pressed }) => [
        styles.row,
        { backgroundColor: colors.card, borderColor: colors.border },
        pressed && { backgroundColor: colors.muted },
      ]}
    >
      <View style={styles.main}>
        <Text numberOfLines={1} style={[styles.title, { color: colors.foreground }]}>
          {title}
        </Text>
        {note.body ? (
          <Text numberOfLines={2} style={[styles.preview, { color: colors.mutedForeground }]}>
            {note.body}
          </Text>
        ) : null}
        {meta ? (
          <Text numberOfLines={1} style={[styles.meta, { color: colors.mutedForeground }]}>
            {meta}
          </Text>
        ) : null}
      </View>
      <View style={styles.pinSlot}>
        <IconAction
          icon={Pin}
          label={`${note.pinned ? "Unpin" : "Pin"} note ${title}`}
          onPress={onTogglePin}
          color={note.pinned ? colors.primary : colors.mutedForeground}
          filled={note.pinned}
          selected={note.pinned}
        />
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: spacing.md,
    borderWidth: 1,
    borderRadius: shape.lg,
    padding: spacing.lg,
  },
  main: {
    flex: 1,
    gap: spacing.xs,
  },
  title: {
    ...typeScale.body,
    fontWeight: "600",
  },
  preview: {
    ...typeScale.label,
    fontWeight: "400",
  },
  meta: {
    ...typeScale.caption,
    marginTop: spacing.xs,
  },
  pinSlot: {
    marginTop: -spacing.sm,
    marginEnd: -spacing.sm,
  },
});

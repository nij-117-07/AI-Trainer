// src/features/brain-dump/components/NoteRow.tsx
/** One note in the list. Tap to open it, or tap the pin to keep it at the top. */
import { Pressable, StyleSheet, Text, View } from "react-native";
import { Pin } from "lucide-react-native";
import { radius, spacing, useThemeColors } from "@/theme";
import type { Note } from "../types";
import { displayTitle, formatUpdated, noteTags } from "../lib/notes";

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
      <Pressable
        onPress={onTogglePin}
        hitSlop={8}
        accessibilityRole="button"
        accessibilityLabel={`${note.pinned ? "Unpin" : "Pin"} note ${title}`}
        accessibilityState={{ selected: note.pinned }}
        style={styles.pin}
      >
        <Pin size={18} color={note.pinned ? colors.primary : colors.mutedForeground} fill={note.pinned ? colors.primary : "none"} />
      </Pressable>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: spacing.md,
    borderWidth: 1,
    borderRadius: radius.xl,
    padding: spacing.lg,
  },
  main: {
    flex: 1,
    gap: spacing.xs,
  },
  title: {
    fontSize: 16,
    fontWeight: "600",
  },
  preview: {
    fontSize: 14,
    lineHeight: 20,
  },
  meta: {
    fontSize: 12,
    marginTop: spacing.xs,
  },
  pin: {
    width: 44,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
    marginTop: -spacing.xs,
    marginEnd: -spacing.sm,
  },
});

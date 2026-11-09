// src/features/brain-dump/components/NoteEditor.tsx
/** Edit one note: title, body, pin, and delete. #tags in the text are picked up automatically. */
import { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { ArrowLeft, Pin, Save, Trash2 } from "lucide-react-native";
import { spacing, useThemeColors } from "@/theme";
import { ActionButton, ErrorText, Panel, TextField } from "@/components/tool/FormControls";
import { Section } from "@/components/tool/Section";
import type { Note, NotePatch } from "../types";
import { extractTags } from "../lib/notes";

interface NoteEditorProps {
  note: Note;
  onBack: () => void;
  onSave: (patch: NotePatch) => void;
  onTogglePin: () => void;
  onDelete: () => void;
}

export function NoteEditor({ note, onBack, onSave, onTogglePin, onDelete }: NoteEditorProps) {
  const colors = useThemeColors();
  const [title, setTitle] = useState(note.title);
  const [body, setBody] = useState(note.body);
  const [error, setError] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const dirty = title !== note.title || body !== note.body;
  const tags = extractTags(`${title}\n${body}`);

  function save() {
    const nextTitle = title.trim();
    const nextBody = body.trim();
    if (!nextTitle && !nextBody) {
      setError("A note needs a title or some text.");
      return;
    }
    setError(null);
    onSave({ title: nextTitle, body: nextBody });
    setTitle(nextTitle);
    setBody(nextBody);
  }

  return (
    <Section>
      <Pressable
        onPress={onBack}
        accessibilityRole="button"
        accessibilityLabel="Back to notes"
        style={({ pressed }) => [styles.backRow, pressed && { opacity: 0.7 }]}
      >
        <ArrowLeft size={18} color={colors.foreground} />
        <Text style={[styles.backText, { color: colors.foreground }]}>All notes</Text>
      </Pressable>

      <Panel>
        <TextField
          label="Title"
          value={title}
          onChangeText={(value) => {
            setTitle(value);
            setError(null);
          }}
          placeholder="Optional. The first line is used when empty."
          maxLength={200}
        />
        <TextField
          label="Note"
          value={body}
          onChangeText={(value) => {
            setBody(value);
            setError(null);
          }}
          multiline
          voice
          style={styles.body}
          placeholder="Write it all down. Use #tags to group ideas."
        />
        {tags.length > 0 ? (
          <Text style={[styles.hint, { color: colors.mutedForeground }]}>
            {tags.map((tag) => `#${tag}`).join("  ")}
          </Text>
        ) : null}
        <ErrorText message={error} />
        <ActionButton label={dirty ? "Save changes" : "Saved"} icon={Save} onPress={save} />
      </Panel>

      <Panel>
        <ActionButton
          label={note.pinned ? "Unpin note" : "Pin note"}
          icon={Pin}
          variant="outline"
          onPress={onTogglePin}
        />
        {confirmDelete ? (
          <View style={styles.actionRow}>
            <View style={styles.flex}>
              <ActionButton label="Yes, delete note" icon={Trash2} onPress={onDelete} />
            </View>
            <View style={styles.flex}>
              <ActionButton label="Cancel" variant="outline" onPress={() => setConfirmDelete(false)} />
            </View>
          </View>
        ) : (
          <ActionButton label="Delete note" icon={Trash2} variant="outline" onPress={() => setConfirmDelete(true)} />
        )}
      </Panel>
    </Section>
  );
}

const styles = StyleSheet.create({
  backRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  backText: {
    fontSize: 15,
    fontWeight: "600",
  },
  body: {
    minHeight: 220,
  },
  hint: {
    fontSize: 13,
    lineHeight: 18,
  },
  actionRow: {
    flexDirection: "row",
    gap: spacing.md,
  },
  flex: {
    flex: 1,
  },
});

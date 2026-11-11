/**
 * Note editor, on its own page. The title and text fields and the tags found in them fill the body.
 * Pin and delete are icon buttons in the top bar. The footer holds the error and the save button.
 */
import { StyleSheet, Text, View } from "react-native";
import { Pin, Save, Trash2 } from "lucide-react-native";
import { spacing, typeScale, useThemeColors } from "@/theme";
import { ActionButton, ErrorText, Panel, TextField } from "@/components/tool/FormControls";
import type { NoteEditorState } from "../hooks/useNoteEditor";
import { extractTags } from "../lib/notes";
import { IconAction } from "./IconAction";

export function NoteEditFields({ editor }: { editor: NoteEditorState }) {
  const colors = useThemeColors();
  const tags = extractTags(`${editor.title}\n${editor.body}`);

  return (
    <Panel>
      <TextField
        label="Title (optional)"
        placeholder="e.g. Call the bank"
        value={editor.title}
        onChangeText={(title) => editor.edit({ title })}
        editable={!editor.pending}
        maxLength={200}
      />
      <TextField
        label="Note"
        placeholder="Write it all down."
        value={editor.body}
        onChangeText={(body) => editor.edit({ body })}
        editable={!editor.pending}
        multiline
        voice
        style={styles.body}
      />
      {tags.length > 0 ? (
        <Text style={[styles.tags, { color: colors.mutedForeground }]}>{tags.map((tag) => `#${tag}`).join("  ")}</Text>
      ) : null}
    </Panel>
  );
}

export function NoteEditActions({ editor }: { editor: NoteEditorState }) {
  const colors = useThemeColors();
  return (
    <View style={styles.actions}>
      <IconAction
        icon={Pin}
        label={editor.pinned ? "Unpin note" : "Pin note"}
        onPress={() => void editor.togglePin()}
        color={editor.pinned ? colors.primary : undefined}
        filled={editor.pinned}
        selected={editor.pinned}
      />
      <IconAction icon={Trash2} label="Delete note" onPress={editor.remove} color={colors.destructive} />
    </View>
  );
}

export function NoteEditFooter({ editor }: { editor: NoteEditorState }) {
  return (
    <View style={styles.footer}>
      <ErrorText message={editor.error} />
      <ActionButton
        label={editor.pending ? "Saving…" : "Save note"}
        icon={Save}
        loading={editor.pending}
        disabled={!editor.dirty}
        onPress={() => void editor.save()}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  actions: {
    flexDirection: "row",
    alignItems: "center",
  },
  footer: {
    gap: spacing.md,
  },
  body: {
    minHeight: 220,
  },
  tags: {
    ...typeScale.caption,
  },
});

/**
 * Note editor, on its own page. The title and text fields, the tags found in them, and the pin and
 * delete actions fill the body. The footer holds the error and the save button.
 */
import { StyleSheet, Text, View } from "react-native";
import { Pin, Save, Trash2 } from "lucide-react-native";
import { spacing, useThemeColors } from "@/theme";
import { ActionButton, ErrorText, Panel, TextField } from "@/components/tool/FormControls";
import type { NoteEditorState } from "../hooks/useNoteEditor";
import { extractTags } from "../lib/notes";

export function NoteEditFields({ editor }: { editor: NoteEditorState }) {
  const colors = useThemeColors();
  const tags = extractTags(`${editor.title}\n${editor.body}`);

  return (
    <>
      <Panel>
        <TextField
          label="Title (optional)"
          placeholder="The first line is used when this is empty."
          value={editor.title}
          onChangeText={(title) => editor.edit({ title })}
          editable={!editor.pending}
          maxLength={200}
        />
        <TextField
          label="Note"
          placeholder="Write it all down. Use #tags to group ideas."
          value={editor.body}
          onChangeText={(body) => editor.edit({ body })}
          editable={!editor.pending}
          multiline
          voice
          style={styles.body}
        />
        {tags.length > 0 ? (
          <Text style={[styles.hint, { color: colors.mutedForeground }]}>{tags.map((tag) => `#${tag}`).join("  ")}</Text>
        ) : null}
      </Panel>

      <Panel>
        <ActionButton
          label={editor.pinned ? "Unpin note" : "Pin note"}
          icon={Pin}
          variant="outline"
          onPress={() => void editor.togglePin()}
        />
        <ActionButton label="Delete note" icon={Trash2} variant="outline" onPress={editor.remove} />
      </Panel>
    </>
  );
}

export function NoteEditFooter({ editor }: { editor: NoteEditorState }) {
  return (
    <View style={styles.footer}>
      <ErrorText message={editor.error} />
      <ActionButton
        label={editor.pending ? "Saving…" : editor.dirty ? "Save changes" : "Saved"}
        icon={Save}
        loading={editor.pending}
        disabled={!editor.dirty}
        onPress={() => void editor.save()}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  footer: {
    gap: spacing.md,
  },
  body: {
    minHeight: 220,
  },
  hint: {
    fontSize: 13,
    lineHeight: 18,
  },
});

/**
 * New note form, on its own page. The capture field fills the body. The footer holds the error and
 * the one primary save button. A saved note returns to the list.
 */
import { StyleSheet, View } from "react-native";
import { Save } from "lucide-react-native";
import { spacing } from "@/theme";
import { ActionButton, ErrorText, TextField } from "@/components/tool/FormControls";
import type { NewNoteState } from "../hooks/useNewNote";

export function NewNoteFields({ note }: { note: NewNoteState }) {
  return (
    <TextField
      label="Brain dump"
      hint="Get it out of your head. Use #tags to group ideas later."
      placeholder="What's on your mind?"
      value={note.text}
      onChangeText={note.setText}
      editable={!note.pending}
      multiline
      voice
      style={styles.dump}
    />
  );
}

export function NewNoteFooter({ note }: { note: NewNoteState }) {
  return (
    <View style={styles.footer}>
      <ErrorText message={note.error} />
      <ActionButton
        label={note.pending ? "Saving…" : "Save to notes"}
        icon={Save}
        loading={note.pending}
        onPress={() => void note.save()}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  footer: {
    gap: spacing.md,
  },
  dump: {
    minHeight: 180,
  },
});

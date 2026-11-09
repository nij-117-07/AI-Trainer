// src/features/brain-dump/components/BrainDumpComposer.tsx
/** New-note form. Shown in the screen footer so it stays visible while the notes scroll. */
import { useState } from "react";
import { StyleSheet, View } from "react-native";
import { Save } from "lucide-react-native";
import { spacing } from "@/theme";
import { ActionButton, ErrorText, Panel, TextField } from "@/components/tool/FormControls";
import { Section } from "@/components/tool/Section";
import { SettingsToggle } from "@/components/tool/SettingsToggle";
import { useCollapsibleForm } from "@/hooks/useCollapsibleForm";
import type { NotesStore } from "../hooks/useNotes";
import { createNote } from "../lib/notes";

interface BrainDumpComposerProps {
  store: NotesStore;
}

export function BrainDumpComposer({ store }: BrainDumpComposerProps) {
  const form = useCollapsibleForm(store.notes.length > 0);
  const [dump, setDump] = useState("");
  const [error, setError] = useState<string | null>(null);

  function capture() {
    const text = dump.trim();
    if (!text) {
      setError("Type something first. Anything counts.");
      return;
    }
    store.addNote(createNote({ body: text }));
    setDump("");
    setError(null);
    form.reset();
  }

  return (
    <Section>
      <SettingsToggle
        title="New note"
        summary={dump.trim() || "Get something out of your head"}
        expanded={form.expanded}
        onToggle={form.toggle}
      />

      {form.expanded ? (
        <Panel>
          <View style={styles.formBody}>
            <TextField
              label="Brain dump"
              hint="Get it out of your head. Use #tags to group ideas later."
              value={dump}
              onChangeText={(value) => {
                setDump(value);
                setError(null);
              }}
              multiline
              voice
              style={styles.dump}
              placeholder="What's on your mind?"
            />
            <ErrorText message={error} />
            <ActionButton label="Save to notes" icon={Save} onPress={capture} />
          </View>
        </Panel>
      ) : null}
    </Section>
  );
}

const styles = StyleSheet.create({
  formBody: {
    gap: spacing.xl,
  },
  dump: {
    minHeight: 140,
  },
});

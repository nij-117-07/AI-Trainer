// src/features/brain-dump/components/BrainDumpTool.tsx
/**
 * Brain dump and notes: get everything on your mind into one box, then search, filter by #tag,
 * pin, and edit notes later. Everything stays on the device.
 */
import { useState } from "react";
import { StyleSheet, Text } from "react-native";
import { Save } from "lucide-react-native";
import { spacing, useThemeColors } from "@/theme";
import { ActionButton, ChoiceChips, ErrorText, Panel, TextField } from "@/components/tool/FormControls";
import { Section } from "@/components/tool/Section";
import { useNotes } from "../hooks/useNotes";
import { allTags, createNote, filterNotes } from "../lib/notes";
import { NoteEditor } from "./NoteEditor";
import { NoteRow } from "./NoteRow";

export function BrainDumpTool() {
  const colors = useThemeColors();
  const store = useNotes();

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [dump, setDump] = useState("");
  const [query, setQuery] = useState("");
  const [tag, setTag] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const selected = store.notes.find((note) => note.id === selectedId) ?? null;
  if (selected) {
    return (
      <NoteEditor
        key={selected.id}
        note={selected}
        onBack={() => setSelectedId(null)}
        onSave={(patch) => store.updateNote(selected.id, patch)}
        onTogglePin={() => store.togglePin(selected.id)}
        onDelete={() => {
          store.removeNote(selected.id);
          setSelectedId(null);
        }}
      />
    );
  }

  const tags = allTags(store.notes);
  const activeTag = tag && tags.includes(tag) ? tag : null;
  const visible = filterNotes(store.notes, { query, tag: activeTag });
  const emptyText = store.loaded
    ? query.trim() || activeTag
      ? "No notes match this search."
      : "No notes yet. Dump something above."
    : "Loading notes…";

  function capture() {
    const text = dump.trim();
    if (!text) {
      setError("Type something first. Anything counts.");
      return;
    }
    store.addNote(createNote({ body: text }));
    setDump("");
    setError(null);
  }

  return (
    <Section>
      <Panel>
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
      </Panel>

      <TextField
        label="Search notes"
        value={query}
        onChangeText={setQuery}
        placeholder="Search titles, text, and #tags"
        maxLength={200}
      />

      {tags.length > 0 ? (
        <ChoiceChips
          options={[{ value: "", label: "All notes" }, ...tags.map((value) => ({ value, label: `#${value}` }))]}
          value={activeTag ?? ""}
          onChange={(value) => setTag(value || null)}
        />
      ) : null}

      {visible.length === 0 ? <Text style={[styles.hint, { color: colors.mutedForeground }]}>{emptyText}</Text> : null}

      {visible.map((note) => (
        <NoteRow
          key={note.id}
          note={note}
          onOpen={() => setSelectedId(note.id)}
          onTogglePin={() => store.togglePin(note.id)}
        />
      ))}
    </Section>
  );
}

const styles = StyleSheet.create({
  dump: {
    minHeight: 140,
  },
  hint: {
    fontSize: 14,
    lineHeight: 20,
    paddingHorizontal: spacing.xs,
  },
});

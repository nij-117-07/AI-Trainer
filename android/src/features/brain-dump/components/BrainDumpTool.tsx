// src/features/brain-dump/components/BrainDumpTool.tsx
/**
 * Notes list: search, filter by #tag, pin, and open notes to edit later. Everything stays on the
 * device. The new-note form lives in the screen footer (see BrainDumpComposer).
 */
import { useState } from "react";
import { StyleSheet, Text } from "react-native";
import { spacing, useThemeColors } from "@/theme";
import { ChoiceChips, TextField } from "@/components/tool/FormControls";
import { Section } from "@/components/tool/Section";
import type { NotesStore } from "../hooks/useNotes";
import { allTags, filterNotes } from "../lib/notes";
import { NoteEditor } from "./NoteEditor";
import { NoteRow } from "./NoteRow";

interface BrainDumpToolProps {
  store: NotesStore;
  selectedId: string | null;
  onSelect: (id: string | null) => void;
}

export function BrainDumpTool({ store, selectedId, onSelect }: BrainDumpToolProps) {
  const colors = useThemeColors();
  const [query, setQuery] = useState("");
  const [tag, setTag] = useState<string | null>(null);

  const selected = store.notes.find((note) => note.id === selectedId) ?? null;
  if (selected) {
    return (
      <NoteEditor
        key={selected.id}
        note={selected}
        onBack={() => onSelect(null)}
        onSave={(patch) => store.updateNote(selected.id, patch)}
        onTogglePin={() => store.togglePin(selected.id)}
        onDelete={() => {
          store.removeNote(selected.id);
          onSelect(null);
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
      : "No notes yet. Use New note below."
    : "Loading notes…";

  return (
    <Section>
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
          onOpen={() => onSelect(note.id)}
          onTogglePin={() => store.togglePin(note.id)}
        />
      ))}
    </Section>
  );
}

const styles = StyleSheet.create({
  hint: {
    fontSize: 14,
    lineHeight: 20,
    paddingHorizontal: spacing.xs,
  },
});

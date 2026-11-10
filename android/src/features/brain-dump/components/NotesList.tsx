/** Notes list body: search, filter by #tag, and the notes. Tapping a note opens its page. The new-note button is in the footer. */
import { useState } from "react";
import { StyleSheet, Text } from "react-native";
import { NotebookPen } from "lucide-react-native";
import { spacing, useThemeColors } from "@/theme";
import { ChoiceChips, TextField } from "@/components/tool/FormControls";
import { EmptyHint } from "@/components/tool/EmptyHint";
import { Section } from "@/components/tool/Section";
import type { NotesStore } from "../hooks/useNotes";
import { allTags, filterNotes } from "../lib/notes";
import { NoteRow } from "./NoteRow";

interface NotesListProps {
  store: NotesStore;
  onOpen: (id: string) => void;
}

export function NotesList({ store, onOpen }: NotesListProps) {
  const colors = useThemeColors();
  const [query, setQuery] = useState("");
  const [tag, setTag] = useState<string | null>(null);

  if (!store.loaded) {
    return <Text style={[styles.hint, { color: colors.mutedForeground }]}>Loading notes…</Text>;
  }

  const tags = allTags(store.notes);
  const activeTag = tag && tags.includes(tag) ? tag : null;
  const visible = filterNotes(store.notes, { query, tag: activeTag });
  const searching = query.trim() !== "" || activeTag !== null;

  return (
    <Section>
      <TextField
        label="Search notes"
        value={query}
        onChangeText={setQuery}
        placeholder="e.g. groceries, #work"
        maxLength={200}
      />

      {tags.length > 0 ? (
        <ChoiceChips
          options={[{ value: "", label: "All notes" }, ...tags.map((value) => ({ value, label: `#${value}` }))]}
          value={activeTag ?? ""}
          onChange={(value) => setTag(value || null)}
        />
      ) : null}

      {store.notes.length === 0 ? (
        <EmptyHint icon={NotebookPen} title="No notes yet" hint="Tap New note below and get something out of your head." />
      ) : visible.length === 0 ? (
        <Text style={[styles.hint, { color: colors.mutedForeground }]}>
          {searching ? "No notes match this search." : "No notes to show."}
        </Text>
      ) : (
        visible.map((note) => (
          <NoteRow key={note.id} note={note} onOpen={() => onOpen(note.id)} onTogglePin={() => void store.togglePin(note.id)} />
        ))
      )}
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

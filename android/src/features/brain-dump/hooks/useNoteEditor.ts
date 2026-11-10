/** Loads one saved note by id, and holds the edit page's fields. Pin and delete write straight to storage. */
import { useEffect, useState } from "react";
import { Alert } from "react-native";
import type { Note } from "../types";
import { loadNotes, removeStoredNote, togglePinStored, updateStoredNote } from "../lib/storage";

/** `undefined` while loading, `null` when the note does not exist. */
export function useStoredNote(id: string): Note | null | undefined {
  const [note, setNote] = useState<Note | null | undefined>(undefined);

  useEffect(() => {
    let active = true;
    loadNotes()
      .then((list) => {
        if (active) setNote(list.find((item) => item.id === id) ?? null);
      })
      .catch(() => {
        if (active) setNote(null);
      });
    return () => {
      active = false;
    };
  }, [id]);

  return note;
}

export type NoteEditorState = ReturnType<typeof useNoteEditor>;

export function useNoteEditor(note: Note, onDeleted: () => void) {
  const [title, setTitle] = useState(note.title);
  const [body, setBody] = useState(note.body);
  const [saved, setSaved] = useState({ title: note.title, body: note.body });
  const [pinned, setPinned] = useState(note.pinned);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  const dirty = title !== saved.title || body !== saved.body;

  function edit(next: { title?: string; body?: string }) {
    if (next.title !== undefined) setTitle(next.title);
    if (next.body !== undefined) setBody(next.body);
    setError(null);
  }

  async function save() {
    const nextTitle = title.trim();
    const nextBody = body.trim();
    if (!nextTitle && !nextBody) {
      setError("A note needs a title or some text.");
      return;
    }
    setPending(true);
    try {
      await updateStoredNote(note.id, { title: nextTitle, body: nextBody });
      setTitle(nextTitle);
      setBody(nextBody);
      setSaved({ title: nextTitle, body: nextBody });
    } catch {
      setError("Could not save the note. Try again.");
    } finally {
      setPending(false);
    }
  }

  async function togglePin() {
    await togglePinStored(note.id);
    setPinned((value) => !value);
  }

  function remove() {
    Alert.alert("Delete this note?", "It cannot be recovered.", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: () => {
          void removeStoredNote(note.id).then(onDeleted);
        },
      },
    ]);
  }

  return { title, body, pinned, dirty, error, pending, edit, save, togglePin, remove };
}

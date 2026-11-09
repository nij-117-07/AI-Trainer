// src/features/brain-dump/hooks/useNotes.ts
/** Brain dump notes kept on the device. Every change is saved as soon as the list updates. */
import { useCallback, useEffect, useState } from "react";
import { loadDocument, saveDocument } from "@/lib/document-store";
import type { Note, NotePatch } from "../types";
import { normalizeNotes } from "../lib/notes";

const NOTES_KEY = "tools.brain-dump.notes.v1";

export function useNotes() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let active = true;
    loadDocument<unknown>(NOTES_KEY, []).then((stored) => {
      if (!active) return;
      setNotes(normalizeNotes(stored));
      setLoaded(true);
    });
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (loaded) void saveDocument(NOTES_KEY, notes);
  }, [loaded, notes]);

  const addNote = useCallback((note: Note) => {
    setNotes((prev) => [note, ...prev]);
  }, []);

  const updateNote = useCallback((id: string, patch: NotePatch) => {
    setNotes((prev) =>
      prev.map((note) => (note.id === id ? { ...note, ...patch, updatedAt: new Date().toISOString() } : note))
    );
  }, []);

  const togglePin = useCallback((id: string) => {
    setNotes((prev) => prev.map((note) => (note.id === id ? { ...note, pinned: !note.pinned } : note)));
  }, []);

  const removeNote = useCallback((id: string) => {
    setNotes((prev) => prev.filter((note) => note.id !== id));
  }, []);

  return { notes, loaded, addNote, updateNote, togglePin, removeNote };
}

export type NotesStore = ReturnType<typeof useNotes>;

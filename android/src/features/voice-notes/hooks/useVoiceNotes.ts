// src/features/voice-notes/hooks/useVoiceNotes.ts
/** Voice notes kept on the device. Every change is saved as soon as the list updates. */
import { useCallback, useEffect, useState } from "react";
import { loadDocument, saveDocument } from "@/lib/document-store";
import type { VoiceNote } from "../types";
import { normalizeNotes, sortNotes } from "../lib/notes";

const STORAGE_KEY = "tools.voice-notes.notes.v1";

export function useVoiceNotes() {
  const [notes, setNotes] = useState<VoiceNote[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let active = true;
    loadDocument<unknown>(STORAGE_KEY, []).then((stored) => {
      if (!active) return;
      setNotes(sortNotes(normalizeNotes(stored)));
      setLoaded(true);
    });
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (loaded) void saveDocument(STORAGE_KEY, notes);
  }, [loaded, notes]);

  const addNote = useCallback((note: VoiceNote) => {
    setNotes((prev) => sortNotes([note, ...prev]));
  }, []);

  const updateNote = useCallback((id: string, patch: Pick<VoiceNote, "title" | "text">) => {
    setNotes((prev) =>
      prev.map((note) => (note.id === id ? { ...note, ...patch, updatedAt: new Date().toISOString() } : note))
    );
  }, []);

  const removeNote = useCallback((id: string) => {
    setNotes((prev) => prev.filter((note) => note.id !== id));
  }, []);

  return { notes, loaded, addNote, updateNote, removeNote };
}

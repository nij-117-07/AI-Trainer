/** New note form state: the saved draft, saving the note, and Reset (which clears the draft only). */
import { useEffect, useState } from "react";
import { loadDocument, saveDocument } from "@/lib/document-store";
import { createNote } from "../lib/notes";
import { addStoredNote, NEW_NOTE_DRAFT_KEY, restoreNewNoteDraft } from "../lib/storage";

export type NewNoteState = ReturnType<typeof useNewNote>;

export function useNewNote(onSaved: () => void) {
  const [text, setTextValue] = useState("");
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  useEffect(() => {
    let active = true;
    loadDocument<unknown>(NEW_NOTE_DRAFT_KEY, null)
      .then((saved) => {
        if (active) setTextValue(restoreNewNoteDraft(saved));
      })
      .catch(() => undefined)
      .finally(() => {
        if (active) setLoaded(true);
      });
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (!loaded) return;
    saveDocument(NEW_NOTE_DRAFT_KEY, text).catch(() => undefined);
  }, [loaded, text]);

  function setText(value: string) {
    setTextValue(value);
    setError(null);
  }

  function reset() {
    setTextValue("");
    setError(null);
  }

  /** Saves the note, clears the draft, and returns to the list. */
  async function save() {
    const body = text.trim();
    if (!body) {
      setError("Type something first. Anything counts.");
      return;
    }
    setPending(true);
    try {
      await addStoredNote(createNote({ body }));
      await saveDocument(NEW_NOTE_DRAFT_KEY, "").catch(() => undefined);
      setTextValue("");
      onSaved();
    } catch {
      setError("Could not save the note. Try again.");
    } finally {
      setPending(false);
    }
  }

  return { text, loaded, error, pending, setText, reset, save };
}

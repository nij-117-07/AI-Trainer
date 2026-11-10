/** The notes list page. It reloads each time the page is focused, so notes changed on other pages appear. */
import { useCallback, useState } from "react";
import { useFocusEffect } from "expo-router";
import type { Note } from "../types";
import { loadNotes, togglePinStored } from "../lib/storage";

export function useNotes() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [loaded, setLoaded] = useState(false);

  useFocusEffect(
    useCallback(() => {
      let active = true;
      loadNotes()
        .then((list) => {
          if (!active) return;
          setNotes(list);
          setLoaded(true);
        })
        .catch(() => undefined);
      return () => {
        active = false;
      };
    }, []),
  );

  const togglePin = useCallback(async (id: string) => {
    await togglePinStored(id);
    setNotes(await loadNotes());
  }, []);

  return { notes, loaded, togglePin };
}

export type NotesStore = ReturnType<typeof useNotes>;

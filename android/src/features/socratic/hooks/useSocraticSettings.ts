// src/features/socratic/hooks/useSocraticSettings.ts
/**
 * Focus and confidence for the Socratic Challenger. The settings page edits them and saves each
 * change. The chat page reads them again each time it is focused, so it shows the latest choice.
 */
import { useCallback, useEffect, useState } from "react";
import { useFocusEffect } from "expo-router";
import { loadDocument, saveDocument } from "@/lib/document-store";
import { DEFAULT_CONFIDENCE, DEFAULT_FOCUS } from "../options";
import { sanitizeConfidence, sanitizeFocus } from "../lib/normalize";
import { SOCRATIC_STORAGE_KEYS } from "../lib/persistence";
import type { SocraticFocus } from "../types";

export function useSocraticSettings() {
  const [focus, setFocus] = useState<SocraticFocus>(DEFAULT_FOCUS);
  const [confidence, setConfidence] = useState<string>(DEFAULT_CONFIDENCE);
  const [loaded, setLoaded] = useState(false);

  useFocusEffect(
    useCallback(() => {
      let active = true;
      Promise.all([
        loadDocument<unknown>(SOCRATIC_STORAGE_KEYS.focus, null),
        loadDocument<unknown>(SOCRATIC_STORAGE_KEYS.confidence, null),
      ])
        .then(([savedFocus, savedConfidence]) => {
          if (!active) return;
          setFocus(sanitizeFocus(savedFocus));
          setConfidence(sanitizeConfidence(savedConfidence));
        })
        .catch(() => undefined)
        .finally(() => {
          if (active) setLoaded(true);
        });
      return () => {
        active = false;
      };
    }, []),
  );

  useEffect(() => {
    if (!loaded) return;
    saveDocument(SOCRATIC_STORAGE_KEYS.focus, focus).catch(() => undefined);
  }, [loaded, focus]);

  useEffect(() => {
    if (!loaded) return;
    saveDocument(SOCRATIC_STORAGE_KEYS.confidence, confidence).catch(() => undefined);
  }, [loaded, confidence]);

  const reset = useCallback(() => {
    setFocus(DEFAULT_FOCUS);
    setConfidence(DEFAULT_CONFIDENCE);
  }, []);

  return { loaded, focus, setFocus, confidence, setConfidence, reset };
}

export type SocraticSettingsState = ReturnType<typeof useSocraticSettings>;

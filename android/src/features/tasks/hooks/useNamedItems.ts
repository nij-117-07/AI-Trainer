// src/features/tasks/hooks/useNamedItems.ts
/** Projects or labels kept on the device, saved as soon as the list changes. */
import { useCallback, useEffect, useState } from "react";
import { loadDocument, saveDocument } from "@/lib/document-store";
import type { NamedItem } from "../types";
import { normalizeNamedItems } from "../lib/named-items";
import { newId } from "../lib/ids";

export function useNamedItems<T extends NamedItem>(storageKey: string) {
  const [items, setItems] = useState<T[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let active = true;
    loadDocument<unknown>(storageKey, []).then((stored) => {
      if (!active) return;
      setItems(normalizeNamedItems<T>(stored));
      setLoaded(true);
    });
    return () => {
      active = false;
    };
  }, [storageKey]);

  useEffect(() => {
    if (loaded) void saveDocument(storageKey, items);
  }, [loaded, storageKey, items]);

  const add = useCallback((name: string) => {
    setItems((prev) => [...prev, { id: newId(), name: name.trim(), createdAt: new Date().toISOString() } as T]);
  }, []);

  const rename = useCallback((id: string, name: string) => {
    setItems((prev) => prev.map((item) => (item.id === id ? { ...item, name } : item)));
  }, []);

  const remove = useCallback((id: string) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
  }, []);

  return { items, loaded, add, rename, remove };
}

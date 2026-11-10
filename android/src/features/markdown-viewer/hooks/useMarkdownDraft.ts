// src/features/markdown-viewer/hooks/useMarkdownDraft.ts
/** Keeps the Markdown draft on the device. Saving waits until the stored draft has loaded. */
import { useCallback, useEffect, useState } from "react";
import { loadDocument, saveDocument } from "@/lib/document-store";

export const MARKDOWN_DRAFT_KEY = "tools.markdown-viewer.content.v1";

export function useMarkdownDraft() {
  const [content, setContent] = useState("");
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let active = true;
    loadDocument<unknown>(MARKDOWN_DRAFT_KEY, "")
      .then((saved) => {
        if (active && typeof saved === "string") setContent(saved);
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
    saveDocument(MARKDOWN_DRAFT_KEY, content).catch(() => undefined);
  }, [loaded, content]);

  const reset = useCallback(() => setContent(""), []);

  return { content, setContent, reset, loaded };
}

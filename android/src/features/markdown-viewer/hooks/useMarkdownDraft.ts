// src/features/markdown-viewer/hooks/useMarkdownDraft.ts
/** Keeps the Markdown draft on the device so it is still there on the next visit. */
import { useEffect, useState } from "react";
import { loadDocument, saveDocument } from "@/lib/document-store";
import { SAMPLE_MARKDOWN } from "../lib/sample";

export const MARKDOWN_DRAFT_KEY = "tools.markdown-viewer.content.v1";

export function useMarkdownDraft() {
  const [content, setContent] = useState(SAMPLE_MARKDOWN);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let active = true;
    loadDocument<unknown>(MARKDOWN_DRAFT_KEY, SAMPLE_MARKDOWN)
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

  return { content, setContent };
}

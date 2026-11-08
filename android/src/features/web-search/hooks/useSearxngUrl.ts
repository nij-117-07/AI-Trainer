// src/features/web-search/hooks/useSearxngUrl.ts
/** Keeps the SearXNG address the user entered on the device. The webui reads this from server config instead. */
import { useEffect, useState } from "react";
import { loadDocument, saveDocument } from "@/lib/document-store";
import { DEFAULT_SEARXNG_URL, SEARXNG_URL_KEY } from "../options";

export function useSearxngUrl() {
  const [searxngUrl, setSearxngUrl] = useState(DEFAULT_SEARXNG_URL);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let active = true;
    loadDocument<unknown>(SEARXNG_URL_KEY, DEFAULT_SEARXNG_URL)
      .then((saved) => {
        if (active && typeof saved === "string") setSearxngUrl(saved);
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
    saveDocument(SEARXNG_URL_KEY, searxngUrl).catch(() => undefined);
  }, [loaded, searxngUrl]);

  return { searxngUrl, setSearxngUrl };
}

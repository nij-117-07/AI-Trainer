// src/features/confidence-builder/lib/store.ts
/** Reads and writes the saved history and the round in progress. */
import { loadDocument, saveDocument } from "@/lib/document-store";
import type { ConfidenceLog } from "../types";
import { toConfidenceLog } from "./normalise";

export const CONFIDENCE_LOG_KEY = "practice.confidence-builder.log.v1";
export const CONFIDENCE_FORM_KEY = "practice.confidence-builder.form.v1";

export async function loadConfidenceLog(): Promise<ConfidenceLog> {
  return toConfidenceLog(await loadDocument<unknown>(CONFIDENCE_LOG_KEY, null));
}

export async function saveConfidenceLog(log: ConfidenceLog): Promise<void> {
  await saveDocument(CONFIDENCE_LOG_KEY, log);
}

// src/features/conceptual-bridge/lib/draft.ts
/**
 * Saved draft of the bridge form and its last result, kept on the device. Stored JSON is not
 * trusted, so every field is checked when it is read back.
 */
import type { BridgeFormValues, BridgeResult } from "../types";
import { isAbstractionDepth, isRecord, normalizeBridge } from "./normalize";

export const BRIDGE_DRAFT_KEY = "learning.conceptual-bridge.v1";

export const DEFAULT_BRIDGE_FORM: BridgeFormValues = {
  conceptA: "Photosynthesis",
  conceptB: "Blockchain",
  abstractionDepth: "structural",
};

export interface BridgeDraft {
  form: BridgeFormValues;
  result: BridgeResult | null;
}

export function normalizeDraft(raw: unknown): BridgeDraft {
  const source = isRecord(raw) ? raw : {};
  const form = isRecord(source.form) ? source.form : {};
  return {
    form: {
      conceptA: typeof form.conceptA === "string" ? form.conceptA : DEFAULT_BRIDGE_FORM.conceptA,
      conceptB: typeof form.conceptB === "string" ? form.conceptB : DEFAULT_BRIDGE_FORM.conceptB,
      abstractionDepth: isAbstractionDepth(form.abstractionDepth)
        ? form.abstractionDepth
        : DEFAULT_BRIDGE_FORM.abstractionDepth,
    },
    result: isRecord(source.result) ? normalizeBridge(source.result) : null,
  };
}

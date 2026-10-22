// src/features/learning/conceptual-bridge/actions/generate.ts
/**
 * Server Action for POST /practice/conceptual_bridge/generate.
 * Builds a deep structural analogy between two seemingly unrelated concepts.
 */
"use server";

import {
  BridgeFormSchema,
  BridgeRequestSchema,
  BridgeResponseSchema,
  type BridgeFormValues,
  type BridgeRequest,
  type BridgeResponse,
} from "../types";
import { postJson, safeParse, learningApiUrl } from "../../lib/api";

export async function generateBridgeAction(input: BridgeFormValues): Promise<BridgeResponse> {
  safeParse(BridgeFormSchema, input, "Invalid bridge request");

  const payload: BridgeRequest = {
    concept_a: input.concept_a,
    concept_b: input.concept_b,
    abstraction_depth: input.abstraction_depth,
  };
  safeParse(BridgeRequestSchema, payload, "Invalid bridge payload");

  const raw = await postJson<unknown>(
    learningApiUrl("/practice/conceptual_bridge", "generate"),
    payload
  );
  return safeParse(BridgeResponseSchema, raw, "Invalid bridge response");
}

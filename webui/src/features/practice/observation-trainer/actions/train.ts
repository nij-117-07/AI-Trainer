// src/features/practice/observation-trainer/actions/train.ts
/**
 * Server Action for POST /practice/observation_trainer/train.
 * Runs the full observation training pipeline on an image (URL or base64).
 */
"use server";

import {
  TrainRequestSchema,
  TrainResponseSchema,
  type TrainRequest,
  type TrainResponse,
} from "../types";
import { postJson, safeParse, practiceApiUrl } from "../../lib/api";

export async function trainObservationAction(input: TrainRequest): Promise<TrainResponse> {
  safeParse(TrainRequestSchema, input, "Invalid training request");

  const raw = await postJson<unknown>(
    practiceApiUrl("/practice/observation_trainer", "train"),
    input
  );
  return safeParse(TrainResponseSchema, raw, "Invalid training response");
}

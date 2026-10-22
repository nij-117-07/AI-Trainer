// src/features/practice/socratic/actions/challenge.ts
/**
 * Server Action for POST /practice/socratic/challenge.
 * Returns a logical challenge to the user's latest statement.
 */
"use server";

import {
  SocraticRequestSchema,
  SocraticResponseSchema,
  type SocraticRequest,
  type SocraticResponse,
} from "../types";
import { postJson, safeParse, practiceApiUrl } from "../../lib/api";

export async function challengeStatementAction(input: SocraticRequest): Promise<SocraticResponse> {
  safeParse(SocraticRequestSchema, input, "Invalid challenge request");

  const raw = await postJson<unknown>(
    practiceApiUrl("/practice/socratic", "challenge"),
    input
  );
  return safeParse(SocraticResponseSchema, raw, "Invalid challenge response");
}

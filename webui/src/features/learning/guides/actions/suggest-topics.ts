// src/features/learning/guides/actions/suggest-topics.ts
/**
 * Server Action for POST /learning/guides/suggest-topics.
 * Recommends next topics while avoiding previously suggested content.
 */
"use server";

import {
  SuggestTopicsFormSchema,
  WhatToLearnRequestSchema,
  WhatToLearnResponseSchema,
  type SuggestTopicsFormValues,
  type WhatToLearnRequest,
  type WhatToLearnResponse,
} from "../types";
import { guidesApiUrl, postJson, safeParse } from "../lib/api";
import { splitLines } from "../lib/text";

export async function suggestTopicsAction(
  input: SuggestTopicsFormValues
): Promise<WhatToLearnResponse> {
  safeParse(SuggestTopicsFormSchema, input, "Invalid topic suggestions request");

  const payload: WhatToLearnRequest = {
    broader_topic: input.broader_topic,
    specific_interest: input.specific_interest,
    learned_before: input.learned_before,
    topic_level: input.topic_level,
    ...(splitLines(input.previous_suggestions).length
      ? { previous_suggestions: splitLines(input.previous_suggestions) }
      : {}),
    ...(input.custom_user_input.trim()
      ? { custom_user_input: input.custom_user_input.trim() }
      : {}),
  };
  safeParse(WhatToLearnRequestSchema, payload, "Invalid topic suggestions payload");

  const raw = await postJson<unknown>(guidesApiUrl("suggest-topics"), payload);
  return safeParse(WhatToLearnResponseSchema, raw, "Invalid topic suggestions response");
}

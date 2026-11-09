// src/features/what-to-do-now/lib/generators.ts
/** What To Do Now generator. Validates the form, calls the model from the saved AI settings, and returns a normalised result. */
import { ax } from "@ax-llm/ax";
import type { AiSettings } from "@/features/ai-settings/types";
import { createLlm } from "@/features/ai-settings/lib/llm";
import type { WhatToDoNowFormValues, WhatToDoNowResult } from "../types";
import { whatToDoNowSignature } from "./signatures";
import { toWhatToDoNowResult } from "./normalise";
import { describeDateTime, EXTRA_INFO_MAX, GOALS_MAX, requireText, SITUATION_MAX } from "./validate";

const TEMPERATURE = 0.4;

export async function whatToDoNow(settings: AiSettings, values: WhatToDoNowFormValues): Promise<WhatToDoNowResult> {
  const input = {
    goals: requireText(values.goals, "Goals", GOALS_MAX),
    currentDateTime: describeDateTime(values.dateTime),
    currentSituation: requireText(values.situation, "Current situation", SITUATION_MAX),
    additionalInfo: values.extraInfo.trim().slice(0, EXTRA_INFO_MAX) || "None",
  };
  const llm = createLlm(settings);
  const result = await ax(whatToDoNowSignature).forward(llm, input, {
    modelConfig: { temperature: TEMPERATURE },
  });
  return toWhatToDoNowResult(result);
}

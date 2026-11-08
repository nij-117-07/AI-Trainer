// src/features/debate/lib/generators.ts
/**
 * Debate Engine generators. Each call runs one of the three Ax signatures from
 * Backend/practice/debate/services.py and normalises the output. Calls take an AbortSignal and
 * pass it to forward() so a cancelled debate stops at once.
 */
import { ax } from "@ax-llm/ax";
import type { AiSettings } from "@/features/ai-settings/types";
import { createLlm } from "@/features/ai-settings/lib/llm";
import type { DebateTurn, JudgeInput, JudgeVerdict, PersonaInput, PersonaProfile, TurnInput } from "../types";
import { debateJudgeSignature, debateTurnSignature, personaArchitectSignature } from "./signatures";
import { normalizePersona, normalizeTurn, normalizeVerdict } from "./normalize";
import { historyText } from "./session";

const TEMPERATURE = 0.6;
const CONTEXT = "General debate";

function callOptions(signal: AbortSignal) {
  return { modelConfig: { temperature: TEMPERATURE }, abortSignal: signal };
}

/** Builds one persona per input, in order. The Pro and Con personas are built in parallel. */
export async function createPersonas(
  signal: AbortSignal,
  settings: AiSettings,
  inputs: PersonaInput[],
): Promise<PersonaProfile[]> {
  const llm = createLlm(settings);
  return Promise.all(
    inputs.map(async (input) =>
      normalizePersona(
        await ax(personaArchitectSignature).forward(
          llm,
          {
            characterArchetype: input.archetype,
            speechStyle: input.style,
            rhetoricalIntensity: input.intensity,
            intellectualInfluences: input.influences.join("\n"),
            debateTopic: input.topic,
            side: input.side,
            customConstraints: input.customConstraints,
          },
          callOptions(signal),
        ),
      ),
    ),
  );
}

export async function takeTurn(signal: AbortSignal, settings: AiSettings, input: TurnInput): Promise<DebateTurn> {
  const llm = createLlm(settings);
  const result = await ax(debateTurnSignature).forward(
    llm,
    {
      systemPrompt: input.systemPrompt,
      debateTopic: input.topic,
      debateContext: CONTEXT,
      chatHistory: historyText(input.history),
      turnStrategy: input.strategy,
      externalEvidence: input.evidence,
      customInstructions: input.instructions,
    },
    callOptions(signal),
  );
  return normalizeTurn(result);
}

export async function judgeDebate(signal: AbortSignal, settings: AiSettings, input: JudgeInput): Promise<JudgeVerdict> {
  const llm = createLlm(settings);
  const result = await ax(debateJudgeSignature).forward(
    llm,
    {
      debateTopic: input.topic,
      proTranscript: input.proTranscript,
      conTranscript: input.conTranscript,
    },
    callOptions(signal),
  );
  return normalizeVerdict(result);
}

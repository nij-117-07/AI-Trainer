// src/features/challenges/lib/normalise.ts
/**
 * Turns raw model output and stored drafts into typed values. Missing or mistyped fields fall
 * back to empty values, so the screen never reads .length or .map on an unchecked field.
 */
import { isRecord, listOf, numberOf, textOf } from "@/features/guides/lib/text";
import type { Challenge, ChallengeDraft, ChallengeFormValues, ChallengeResult } from "../types";
import { clampCount, INSTRUCTIONS_MAX, isChallengeLevel, isChallengeTime, isChallengeType, TOPIC_MAX } from "./validate";

function textList(value: unknown): string[] {
  return listOf(value).map(textOf).filter((item) => item !== "");
}

export function toChallenge(raw: unknown): Challenge {
  const item = isRecord(raw) ? raw : {};
  return {
    kept: item.kept === true,
    title: textOf(item.title),
    prompt: textOf(item.prompt),
    successCriteria: textList(item.successCriteria),
    hints: textList(item.hints),
    estimatedMinutes: numberOf(item.estimatedMinutes),
  };
}

export function toChallengeResult(raw: unknown): ChallengeResult {
  const record = isRecord(raw) ? raw : {};
  return {
    challenges: listOf(record.challenges).map(toChallenge),
    coachNote: textOf(record.coachNote),
  };
}

export function toChallengeForm(raw: unknown, defaults: ChallengeFormValues): ChallengeFormValues {
  const record = isRecord(raw) ? raw : {};
  return {
    topic: typeof record.topic === "string" ? record.topic.slice(0, TOPIC_MAX) : defaults.topic,
    challengeType: isChallengeType(record.challengeType) ? record.challengeType : defaults.challengeType,
    skillLevel: isChallengeLevel(record.skillLevel) ? record.skillLevel : defaults.skillLevel,
    timeMinutes: isChallengeTime(record.timeMinutes) ? record.timeMinutes : defaults.timeMinutes,
    numChallenges: clampCount(record.numChallenges, defaults.numChallenges),
    instructions:
      typeof record.instructions === "string" ? record.instructions.slice(0, INSTRUCTIONS_MAX) : defaults.instructions,
  };
}

export function toChallengeDraft(raw: unknown, defaults: ChallengeFormValues): ChallengeDraft {
  const record = isRecord(raw) ? raw : {};
  return {
    form: toChallengeForm(record.form, defaults),
    result: isRecord(record.result) ? toChallengeResult(record.result) : null,
  };
}

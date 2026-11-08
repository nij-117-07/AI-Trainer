// src/features/socratic/lib/transcript.ts
/**
 * Builds the chat transcript shown to the user and the history text sent to the model. Matches the
 * webui: user lines start with "User:", challenger replies with "AI:", and an empty history reads
 * "No prior history." as in Backend/practice/socratic/services.py.
 */
import type { ChatMessage, SocraticChallenge } from "../types";

export function formatChallenge(challenge: SocraticChallenge): string {
  const parts: string[] = [];
  if (challenge.logicalFallacyCheck) {
    parts.push(`**Logical fallacy detected:** ${challenge.logicalFallacyCheck}`);
  } else {
    parts.push("**Logical fallacy check:** None detected");
  }
  parts.push(`**Falsification question:** ${challenge.falsificationQuestion}`);
  parts.push(`**Edge case to consider:** ${challenge.edgeCaseScenario}`);
  parts.push(`**Refined perspective:** ${challenge.refinedPerspective}`);
  return parts.join("\n\n");
}

export function toHistory(messages: ChatMessage[]): string[] {
  return messages.map((message) => (message.role === "user" ? `User: ${message.content}` : `AI: ${message.content}`));
}

export function formatHistory(lines: string[]): string {
  if (lines.length === 0) return "No prior history.";
  return lines.join("\n");
}

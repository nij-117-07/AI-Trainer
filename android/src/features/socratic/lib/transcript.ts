// src/features/socratic/lib/transcript.ts
/**
 * Builds the chat transcript shown to the user and the history text sent to the model. User lines
 * start with "User:", and challenger replies and wrap-ups start with "AI:". An empty history reads
 * "No prior history.".
 */
import type { ChatMessage, SocraticChallenge, SocraticSynthesis } from "../types";

export function formatChallenge(challenge: SocraticChallenge): string {
  const parts: string[] = [];
  parts.push(
    challenge.logicalFallacyCheck
      ? `**Fallacy check:** ${challenge.logicalFallacyCheck}`
      : "**Fallacy check:** None detected",
  );
  if (challenge.hiddenAssumption) parts.push(`**Hidden assumption:** ${challenge.hiddenAssumption}`);
  if (challenge.strongestCounterargument) {
    parts.push(`**Strongest case against it:** ${challenge.strongestCounterargument}`);
  }
  if (challenge.bothSidesView) parts.push(`**Both sides:** ${challenge.bothSidesView}`);
  if (challenge.probingQuestion) parts.push(`**Question for you:** ${challenge.probingQuestion}`);
  return parts.join("\n\n");
}

export function formatSynthesis(synthesis: SocraticSynthesis): string {
  const parts: string[] = [];
  if (synthesis.strongestCaseForUserView) {
    parts.push(`**Strongest case for your view:** ${synthesis.strongestCaseForUserView}`);
  }
  if (synthesis.strongestCaseAgainstUserView) {
    parts.push(`**Strongest case against it:** ${synthesis.strongestCaseAgainstUserView}`);
  }
  if (synthesis.sharedGround) parts.push(`**Common ground:** ${synthesis.sharedGround}`);
  if (synthesis.unresolvedQuestions.length > 0) {
    parts.push(`**Still open:**\n\n${synthesis.unresolvedQuestions.map((item) => `- ${item}`).join("\n")}`);
  }
  if (synthesis.refinedPosition) parts.push(`**Refined position:** ${synthesis.refinedPosition}`);
  return parts.join("\n\n");
}

export function toHistory(messages: ChatMessage[]): string[] {
  return messages.map((message) => (message.role === "user" ? `User: ${message.content}` : `AI: ${message.content}`));
}

export function formatHistory(lines: string[]): string {
  if (lines.length === 0) return "No prior history.";
  return lines.join("\n");
}

// src/features/debate/lib/session.ts
/**
 * Pure helpers for a debate session: opening the board, adding a statement to the right side,
 * and building the inputs for the turn and judge calls.
 */
import { DEFAULT_INSTRUCTIONS, LIMITS } from "../options";
import type {
  DebateSession,
  DebateSide,
  DebateTurn,
  HistoryEntry,
  JudgeInput,
  PersonaProfile,
  TurnInput,
  TurnPayload,
} from "../types";
import { optionalText, requireText } from "./validate";

export function createSession(topic: string, pro: PersonaProfile, con: PersonaProfile): DebateSession {
  return {
    topic,
    proPersona: pro,
    conPersona: con,
    history: [],
    log: [
      `**${pro.personaName}** (for) and **${con.personaName}** (against) are ready on "${topic}". Each turn, pick a side and either type the argument yourself or generate it with AI.`,
    ],
    lastTurn: null,
    proTranscript: "",
    conTranscript: "",
    complete: false,
    verdict: null,
  };
}

/** Adds one statement to the side's transcript, the exchange history, and the chat log. */
export function appendStatement(
  session: DebateSession,
  side: DebateSide,
  statement: string,
  lastTurn: DebateTurn | null,
): DebateSession {
  const persona = side === "pro" ? session.proPersona : session.conPersona;
  return {
    ...session,
    history: [...session.history, { role: "user", content: statement }],
    log: [...session.log, `**${side.toUpperCase()} (${persona.personaName})**: ${statement}`],
    lastTurn,
    proTranscript: side === "pro" ? `${session.proTranscript}${statement}\n\n` : session.proTranscript,
    conTranscript: side === "con" ? `${session.conTranscript}${statement}\n\n` : session.conTranscript,
  };
}

export function historyText(history: HistoryEntry[]): string {
  if (history.length === 0) return "No exchanges yet.";
  return history.map((entry) => `${entry.role}: ${entry.content}`).join("\n");
}

export function buildTurnInput(session: DebateSession, payload: TurnPayload): TurnInput {
  const persona = payload.side === "pro" ? session.proPersona : session.conPersona;
  if (!persona.systemPrompt) throw new Error("This persona has no system prompt. Edit or regenerate it first.");
  return {
    systemPrompt: persona.systemPrompt,
    topic: session.topic,
    history: session.history,
    strategy: payload.strategy,
    evidence: optionalText(payload.evidence, "Evidence", LIMITS.evidence),
    instructions: optionalText(payload.text, "Direction", LIMITS.direction) ?? DEFAULT_INSTRUCTIONS,
  };
}

export function buildJudgeInput(session: DebateSession): JudgeInput {
  if (!session.proTranscript.trim() && !session.conTranscript.trim()) {
    throw new Error("Add at least one statement before judging.");
  }
  return {
    topic: requireText(session.topic, "Debate topic", LIMITS.topic),
    proTranscript: session.proTranscript.trim() || "No statements were made.",
    conTranscript: session.conTranscript.trim() || "No statements were made.",
  };
}

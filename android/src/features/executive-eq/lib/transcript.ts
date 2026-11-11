// src/features/executive-eq/lib/transcript.ts
/** Transcript text for the coach's evaluation of each reply, and the lookup from each evaluation to its grade. */
import type { EvaluationResult, ExecutiveEqSession } from "../types";

export const EVALUATION_HEADING = "**Coach's evaluation**";

export function formatEvaluation(evaluation: EvaluationResult): string {
  return `${EVALUATION_HEADING}\n\nSubtext: ${evaluation.subtextAccuracy}\nStatus: ${evaluation.statusImpact} · Strategic grade: **${evaluation.strategicGrade}**\n\n**Rewritten pro move:** ${evaluation.theRewrittenProMove}\n\n**Tip:** ${evaluation.coachingTip}`;
}

/** Each evaluation is logged together with its grade, in order, so the nth evaluation in the log is grades[n]. */
export function gradeByLogIndex(session: ExecutiveEqSession): Map<number, EvaluationResult> {
  const grades = new Map<number, EvaluationResult>();
  let next = 0;
  session.log.forEach((entry, index) => {
    if (entry.role === "assistant" && entry.content.startsWith(EVALUATION_HEADING) && next < session.grades.length) {
      grades.set(index, session.grades[next]);
      next += 1;
    }
  });
  return grades;
}

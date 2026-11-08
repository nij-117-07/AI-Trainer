// src/features/clarity-trainer/lib/summary.ts
/** Builds the analysis summary that the coach reads, in the same wording as the backend. */
import type { ResponseAnalysis } from "../types";

export function buildAnalysisSummary(analysis: ResponseAnalysis): string {
  const fillers = analysis.fillerWords.length > 0 ? analysis.fillerWords.join(", ") : "none";
  return (
    `Verbosity: ${analysis.verbosity}, ` +
    `Clarity: ${analysis.clarity}, ` +
    `Words: ${analysis.wordCount}, ` +
    `Goal Achievement: ${Math.round(analysis.goalAchievement * 100)}%, ` +
    `Tone Fit: ${Math.round(analysis.toneFit * 100)}%, ` +
    `Fillers: ${fillers}, ` +
    `Core message: '${analysis.coreMessage}'. ` +
    `Context fit: ${analysis.scenarioFitNote}`
  );
}

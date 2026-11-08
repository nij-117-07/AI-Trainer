// src/features/foresight-trainer/lib/session.ts
/**
 * Pure state transitions for a Foresight scenario: starting one, applying each decision outcome,
 * and the transcript text for every step. The screen only has to call these and store the result.
 */
import type {
  DecisionOutcome,
  ForesightSession,
  ProgressReport,
  Scene,
  StartResult,
} from "../types";

export function sceneMessage(sceneNumber: number, scene: Scene): string {
  const time = scene.timePressure ? `\n\n*${scene.timePressure}*` : "";
  return `**Scene ${sceneNumber}**\n\n${scene.sceneNarrative}\n\n**Decision point:** ${scene.decisionPoint}${time}`;
}

export function formatDecision(outcome: DecisionOutcome): string {
  const { evaluation, consequences, insight } = outcome;
  const scoreLines = Object.entries(evaluation.scores)
    .map(([key, value]) => `- **${key}**: ${value}/10`)
    .join("\n");
  return [
    `**Evaluation** (overall ${evaluation.overallScore.toFixed(1)}/10)\n${scoreLines}`,
    `**Strengths:** ${evaluation.strengths.join("; ")}`,
    `**Blind spots:** ${evaluation.blindSpots.join("; ")}`,
    `**Thinking pattern:** ${evaluation.thinkingPattern}`,
    `**One lesson:** ${evaluation.oneLesson}`,
    ``,
    `**Consequences**\n- Immediate: ${consequences.immediateEffects.join("; ")}\n- Delayed: ${consequences.delayedEffects.join("; ")}`,
    `**Hidden reveal:** ${consequences.hiddenReveal}`,
    `**New complication:** ${consequences.newComplication}`,
    `**Relationships:** ${consequences.relationshipImpact}`,
    `**Resources:** ${consequences.resourceChanges}`,
    `**World state:** ${consequences.worldStateUpdate}`,
    ``,
    `**Insight**\n- Pattern: ${insight.patternObservation}`,
    `- Bias alert: ${insight.cognitiveBiasAlert}`,
    `- Strength spotlight: ${insight.strengthSpotlight}`,
    `- Growth edge: ${insight.growthEdge}`,
    `- Real-world parallel: ${insight.realWorldParallel}`,
    `- **Coaching question:** ${insight.coachingQuestion}`,
  ].join("\n");
}

export function formatProgressReport(report: ProgressReport): string {
  return [
    `**Progress report**`,
    `**Archetype:** ${report.archetype}`,
    `**Skill assessment:** ${report.skillAssessment}`,
    ``,
    report.overallGrowth,
    ``,
    `**Dominant pattern:** ${report.dominantPattern}`,
    `**Underused strengths:** ${report.underusedStrengths.join("; ")}`,
    `**Critical blind spot:** ${report.criticalBlindSpot}`,
    `**Best moment:** ${report.bestMoment}`,
    `**Recommended focus:** ${report.recommendedFocus}`,
  ].join("\n");
}

export function createSession(theme: string, start: StartResult): ForesightSession {
  return {
    theme,
    blueprint: start.blueprint,
    maxScenes: start.maxScenes,
    sceneNumber: 1,
    currentScene: start.scene,
    options: start.options,
    customOptionPrompt: start.customOptionPrompt,
    decisionHistory: [],
    scenarioComplete: false,
    progressReport: null,
    log: [{ role: "assistant", content: sceneMessage(1, start.scene) }],
  };
}

/** Adds the decision's evaluation to the transcript and moves to the next scene, or ends the scenario. */
export function applyDecision(session: ForesightSession, outcome: DecisionOutcome): ForesightSession {
  const withDecision = [...session.log, { role: "assistant" as const, content: formatDecision(outcome) }];

  if (outcome.scenarioComplete) {
    const report = outcome.progressReport;
    return {
      ...session,
      decisionHistory: outcome.decisionHistory,
      scenarioComplete: true,
      progressReport: report,
      log: report
        ? [...withDecision, { role: "assistant" as const, content: formatProgressReport(report) }]
        : withDecision,
    };
  }

  const nextSceneNumber = session.sceneNumber + 1;
  const nextScene = outcome.nextScene;
  return {
    ...session,
    sceneNumber: nextSceneNumber,
    currentScene: nextScene ?? session.currentScene,
    options: outcome.nextOptions.length > 0 ? outcome.nextOptions : session.options,
    customOptionPrompt: outcome.customOptionPrompt ?? session.customOptionPrompt,
    decisionHistory: outcome.decisionHistory,
    log: nextScene
      ? [...withDecision, { role: "assistant" as const, content: sceneMessage(nextSceneNumber, nextScene) }]
      : withDecision,
  };
}

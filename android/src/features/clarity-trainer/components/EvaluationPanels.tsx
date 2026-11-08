// src/features/clarity-trainer/components/EvaluationPanels.tsx
/**
 * Review of one reply: verbosity and clarity analysis, coach feedback, a tighter rewrite, and the
 * gold-standard response. Lists are read through textList so a restored draft cannot break a render.
 */
import type { ReactNode } from "react";
import { StyleSheet, Text, View } from "react-native";
import { Award, Check, Gauge, GitCompareArrows, Lightbulb, Scissors, Trophy, type LucideIcon } from "lucide-react-native";
import { radius, spacing, useThemeColors } from "@/theme";
import { Panel } from "@/components/tool/FormControls";
import { MarkdownText } from "@/components/tool/MarkdownText";
import { ResultCallout } from "@/components/tool/ResultCallout";
import { SectionTitle } from "@/components/tool/SectionTitle";
import { TagList } from "@/components/tool/TagList";
import { textList } from "../lib/text";
import type { BetterVersion, ClarityEvaluation, CoachFeedback, GoldStandard, ResponseAnalysis } from "../types";

export function EvaluationPanels({ evaluation }: { evaluation: ClarityEvaluation }) {
  return (
    <>
      <AnalysisPanel analysis={evaluation.analysis} userResponse={evaluation.userResponse} />
      <CoachPanel feedback={evaluation.feedback} />
      <RewritePanel version={evaluation.betterVersion} />
      <GoldPanel gold={evaluation.goldStandard} />
    </>
  );
}

function AnalysisPanel({ analysis, userResponse }: { analysis: ResponseAnalysis; userResponse: string }) {
  const colors = useThemeColors();
  const clear = analysis.clarity === "excellent" || analysis.clarity === "good";
  const fillers = textList(analysis.fillerWords);
  const redundant = textList(analysis.redundantPhrases);
  return (
    <Panel>
      <SectionTitle icon={Gauge} title="Verbosity & clarity" />
      <View style={styles.row}>
        <Pill label={analysis.verbosity} />
        <Pill label={`Clarity: ${analysis.clarity}`} palette={clear ? colors.tone.emerald : colors.tone.rose} />
        <Pill label={`${analysis.wordCount} words`} />
      </View>
      <ScoreBar label="Goal achievement" value={analysis.goalAchievement} color={colors.tone.emerald.fg} />
      <ScoreBar label="Tone fit" value={analysis.toneFit} color={colors.tone.sky.fg} />
      {fillers.length > 0 && <Labeled title="Filler words"><TagList items={fillers} /></Labeled>}
      {redundant.length > 0 && <Labeled title="Redundant phrases"><TagList items={redundant} /></Labeled>}
      <Labeled title="Core message">
        <Text style={[styles.body, { color: colors.foreground }]}>{analysis.coreMessage}</Text>
      </Labeled>
      <Text style={[styles.note, { color: colors.mutedForeground }]}>{analysis.scenarioFitNote}</Text>
      <Labeled title="Your reply">
        <Text style={[styles.body, { color: colors.mutedForeground }]}>{userResponse}</Text>
      </Labeled>
    </Panel>
  );
}

function CoachPanel({ feedback }: { feedback: CoachFeedback }) {
  const colors = useThemeColors();
  const scoreColor =
    feedback.score >= 7 ? colors.tone.emerald.fg : feedback.score >= 4 ? colors.tone.amber.fg : colors.tone.rose.fg;
  return (
    <Panel>
      <SectionTitle icon={Award} title="Coach feedback" />
      <View style={styles.scoreHeader}>
        <Text style={[styles.bigScore, { color: colors.foreground }]}>{feedback.score}</Text>
        <Text style={[styles.body, { color: colors.mutedForeground }]}>/ 10</Text>
      </View>
      <ScoreTrack percent={feedback.score * 10} color={scoreColor} />
      <Text style={[styles.body, { color: colors.mutedForeground }]}>{feedback.coachMessage}</Text>
      <Labeled title="What worked" icon={Check}>
        <Bullets items={textList(feedback.whatWorked)} />
      </Labeled>
      <Labeled title="What to cut" icon={Scissors}>
        <Bullets items={textList(feedback.whatToCut)} />
      </Labeled>
      {textList(feedback.whatToAdd).length > 0 && (
        <Labeled title="What to add">
          <Bullets items={textList(feedback.whatToAdd)} />
        </Labeled>
      )}
      <ResultCallout icon={Lightbulb} title="Make it punchier" tone="amber">
        <Text style={[styles.body, { color: colors.foreground }]}>{feedback.rewriteSuggestion}</Text>
        <Text style={[styles.note, { color: colors.mutedForeground }]}>Remember: {feedback.onePrinciple}</Text>
      </ResultCallout>
    </Panel>
  );
}

function RewritePanel({ version }: { version: BetterVersion }) {
  const colors = useThemeColors();
  return (
    <Panel>
      <SectionTitle icon={GitCompareArrows} title="Your response, tightened" />
      <MarkdownText content={version.rewritten} />
      <Text style={[styles.note, { color: colors.mutedForeground }]}>
        {version.originalWords} → {version.newWords} words ({Math.round(version.percentReduced)}% reduced)
      </Text>
      <Bullets items={textList(version.whyBetter)} />
    </Panel>
  );
}

function GoldPanel({ gold }: { gold: GoldStandard }) {
  const colors = useThemeColors();
  return (
    <ResultCallout icon={Trophy} title="The gold standard" tone="emerald">
      <Text style={[styles.note, { color: colors.mutedForeground }]}>
        {gold.wordCount} words · ~{gold.seconds}s
      </Text>
      <Labeled title="Opening">
        <Text style={[styles.body, styles.italic, { color: colors.foreground }]}>{gold.opening}</Text>
      </Labeled>
      <MarkdownText content={gold.fullResponse} />
      <Bullets items={textList(gold.whyIdeal)} />
    </ResultCallout>
  );
}

interface Palette {
  bg: string;
  border: string;
  fg: string;
}

function Pill({ label, palette }: { label: string; palette?: Palette }) {
  const colors = useThemeColors();
  const tone = palette ?? { bg: colors.card, border: colors.border, fg: colors.foreground };
  return (
    <View style={[styles.pill, { backgroundColor: tone.bg, borderColor: tone.border }]}>
      <Text style={[styles.pillText, { color: tone.fg }]}>{label}</Text>
    </View>
  );
}

function ScoreBar({ label, value, color }: { label: string; value: number; color: string }) {
  const colors = useThemeColors();
  const percent = Math.round(value * 100);
  return (
    <View style={styles.labeled}>
      <View style={styles.scoreHeader}>
        <Text style={[styles.label, { color: colors.mutedForeground }]}>{label}</Text>
        <Text style={[styles.label, { color: colors.foreground }]}>{percent}%</Text>
      </View>
      <ScoreTrack percent={percent} color={color} />
    </View>
  );
}

function ScoreTrack({ percent, color }: { percent: number; color: string }) {
  const colors = useThemeColors();
  return (
    <View style={[styles.track, { backgroundColor: colors.muted }]}>
      <View style={[styles.fill, { backgroundColor: color, width: `${Math.max(0, Math.min(100, percent))}%` }]} />
    </View>
  );
}

function Labeled({ title, icon, children }: { title: string; icon?: LucideIcon; children: ReactNode }) {
  const colors = useThemeColors();
  return (
    <View style={styles.labeled}>
      {icon ? (
        <SectionTitle icon={icon} title={title} />
      ) : (
        <Text style={[styles.label, { color: colors.mutedForeground }]}>{title}</Text>
      )}
      {children}
    </View>
  );
}

function Bullets({ items }: { items: string[] }) {
  if (items.length === 0) return null;
  return <MarkdownText content={items.map((item) => `- ${item}`).join("\n")} />;
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
  },
  pill: {
    borderWidth: 1,
    borderRadius: radius.full,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
  },
  pillText: {
    fontSize: 13,
    fontWeight: "600",
  },
  labeled: {
    gap: spacing.sm,
  },
  label: {
    fontSize: 13,
    fontWeight: "600",
  },
  body: {
    fontSize: 15,
    lineHeight: 22,
  },
  italic: {
    fontStyle: "italic",
  },
  note: {
    fontSize: 13,
    lineHeight: 19,
  },
  scoreHeader: {
    flexDirection: "row",
    alignItems: "baseline",
    justifyContent: "space-between",
    gap: spacing.xs,
  },
  bigScore: {
    fontSize: 28,
    fontWeight: "700",
  },
  track: {
    height: 8,
    borderRadius: radius.full,
    overflow: "hidden",
  },
  fill: {
    height: "100%",
  },
});

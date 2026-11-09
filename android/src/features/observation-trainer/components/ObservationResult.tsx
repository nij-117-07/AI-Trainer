// src/features/observation-trainer/components/ObservationResult.tsx
/**
 * Observation report: score and rating, accuracy and relevance, strengths and areas to work on,
 * the ground-truth description, and (when requested) the details the user missed.
 */
import { StyleSheet, Text, View } from "react-native";
import { CircleCheck, Eye, Lightbulb, ListChecks, Search, Sparkles, Target, TriangleAlert } from "lucide-react-native";
import { radius, spacing, useThemeColors, type Tone } from "@/theme";
import { Panel } from "@/components/tool/FormControls";
import { ListenButton } from "@/components/tool/ListenButton";
import { MarkdownText } from "@/components/tool/MarkdownText";
import { ResultCallout } from "@/components/tool/ResultCallout";
import { SectionTitle } from "@/components/tool/SectionTitle";
import type { ObservationTrainResult, ScenarioPriority } from "../types";
import { BulletList, LabeledText } from "./ResultParts";

const PRIORITY_TONE: Record<ScenarioPriority, Tone> = {
  high: "rose",
  medium: "amber",
  low: "sky",
};

function scoreTone(score: number): Tone {
  if (score >= 7) return "emerald";
  if (score >= 4) return "amber";
  return "rose";
}

export function ObservationResult({ result }: { result: ObservationTrainResult }) {
  const colors = useThemeColors();
  const { evaluation, imageAnalysis, hiddenDetails } = result;
  const palette = colors.tone[scoreTone(evaluation.score)];

  return (
    <>
      <Panel>
        <View style={styles.scoreRow}>
          <Text style={[styles.score, { color: colors.foreground }]}>
            {evaluation.score}
            <Text style={[styles.outOf, { color: colors.mutedForeground }]}> / 10</Text>
          </Text>
          <View style={[styles.badge, { backgroundColor: palette.bg, borderColor: palette.border }]}>
            <Text style={[styles.badgeText, { color: palette.fg }]}>{evaluation.rating}</Text>
          </View>
        </View>
        <View style={[styles.bar, { backgroundColor: colors.muted }]}>
          <View style={[styles.barFill, { width: `${evaluation.score * 10}%`, backgroundColor: palette.fg }]} />
        </View>

        <LabeledText label="Accuracy" body={evaluation.accuracyAssessment} />
        <LabeledText label="Scenario relevance" body={evaluation.scenarioRelevance} />

        <ResultCallout icon={CircleCheck} title="Strengths" tone="emerald">
          <BulletList items={evaluation.strengths} />
        </ResultCallout>
        <ResultCallout icon={TriangleAlert} title="To work on" tone="rose">
          <BulletList items={evaluation.areasForImprovement} />
        </ResultCallout>

        <ResultCallout icon={Search} title="Scenario feedback" tone="sky">
          <MarkdownText content={evaluation.scenarioFeedback} />
          <ListenButton text={evaluation.scenarioFeedback} label="Scenario feedback" />
        </ResultCallout>
        <ResultCallout icon={Sparkles} title="Feedback" tone="amber">
          <MarkdownText content={evaluation.feedback} />
          <ListenButton text={evaluation.feedback} label="Feedback" />
        </ResultCallout>
      </Panel>

      <Panel>
        <SectionTitle icon={Eye} title="Ground-truth analysis" />
        <LabeledText label="What is actually there" body={imageAnalysis.groundTruthDescription} />
        <ListenButton text={imageAnalysis.groundTruthDescription} label="Ground truth" />
        {imageAnalysis.keyElements.length > 0 && (
          <View style={styles.block}>
            <Text style={[styles.label, { color: colors.foreground }]}>Key elements</Text>
            <BulletList items={imageAnalysis.keyElements} />
          </View>
        )}
        {imageAnalysis.subtleDetails.length > 0 && (
          <View style={styles.block}>
            <Text style={[styles.label, { color: colors.foreground }]}>Subtle details</Text>
            <BulletList items={imageAnalysis.subtleDetails} />
          </View>
        )}
      </Panel>

      {hiddenDetails && (
        <Panel>
          <SectionTitle icon={Lightbulb} title="Details you missed" />
          {hiddenDetails.missedItems.length === 0 ? (
            <Text style={[styles.muted, { color: colors.mutedForeground }]}>No missed details were returned.</Text>
          ) : (
            hiddenDetails.missedItems.map((item, index) => {
              const priority = colors.tone[PRIORITY_TONE[item.scenarioPriority]];
              return (
                <View key={`${item.detail}-${index}`} style={[styles.missed, { borderColor: colors.border, backgroundColor: colors.muted }]}>
                  <View style={styles.missedHeader}>
                    <Text style={[styles.missedTitle, { color: colors.foreground }]}>
                      {item.category ? `[${item.category}] ` : ""}
                      {item.detail}
                    </Text>
                    <View style={[styles.badge, { backgroundColor: priority.bg, borderColor: priority.border }]}>
                      <Text style={[styles.badgeText, { color: priority.fg }]}>{item.scenarioPriority}</Text>
                    </View>
                  </View>
                  <Text style={[styles.muted, { color: colors.mutedForeground }]}>{item.significance}</Text>
                </View>
              );
            })
          )}

          <ResultCallout icon={Target} title="Potential score" tone="sky">
            <Text style={[styles.body, { color: colors.foreground }]}>
              {hiddenDetails.potentialScore}/10 if you notice these.
            </Text>
            {hiddenDetails.skillGap !== "" && <MarkdownText content={hiddenDetails.skillGap} />}
          </ResultCallout>
          <ResultCallout icon={Lightbulb} title="Training tip" tone="amber">
            <MarkdownText content={hiddenDetails.trainingTip} />
            <ListenButton text={hiddenDetails.trainingTip} label="Training tip" />
          </ResultCallout>
          <ResultCallout icon={ListChecks} title="Practice exercise" tone="emerald">
            <MarkdownText content={hiddenDetails.practiceExercise} />
          </ResultCallout>
          {hiddenDetails.encouragement !== "" && (
            <Text style={[styles.encouragement, { color: colors.mutedForeground }]}>{hiddenDetails.encouragement}</Text>
          )}
        </Panel>
      )}
    </>
  );
}

const styles = StyleSheet.create({
  scoreRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing.md,
  },
  score: {
    fontSize: 36,
    fontWeight: "700",
  },
  outOf: {
    fontSize: 16,
    fontWeight: "400",
  },
  badge: {
    borderWidth: 1,
    borderRadius: radius.full,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
  },
  badgeText: {
    fontSize: 13,
    fontWeight: "600",
    textTransform: "capitalize",
  },
  bar: {
    height: 10,
    borderRadius: radius.full,
    overflow: "hidden",
  },
  barFill: {
    height: "100%",
    borderRadius: radius.full,
  },
  block: {
    gap: spacing.sm,
  },
  label: {
    fontSize: 15,
    fontWeight: "600",
  },
  muted: {
    fontSize: 14,
    lineHeight: 20,
  },
  body: {
    fontSize: 15,
    lineHeight: 22,
  },
  missed: {
    borderWidth: 1,
    borderRadius: radius.lg,
    padding: spacing.md,
    gap: spacing.sm,
  },
  missedHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: spacing.sm,
  },
  missedTitle: {
    flex: 1,
    fontSize: 15,
    fontWeight: "600",
  },
  encouragement: {
    fontSize: 14,
    fontStyle: "italic",
    lineHeight: 20,
  },
});

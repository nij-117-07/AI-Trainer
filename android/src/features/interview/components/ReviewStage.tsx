// src/features/interview/components/ReviewStage.tsx
/**
 * Step 4: the reviewer's scores and feedback. The footer holds Track progress (or Re-review while
 * editing the answer). The body holds Edit answer.
 */
import { StyleSheet, Text, View } from "react-native";
import { Flag, Lightbulb, Pencil } from "lucide-react-native";
import { radius, spacing, useThemeColors } from "@/theme";
import { ActionButton, TextField } from "@/components/tool/FormControls";
import { ListenButton } from "@/components/tool/ListenButton";
import { MarkdownText } from "@/components/tool/MarkdownText";
import { ResultCallout } from "@/components/tool/ResultCallout";
import type { InterviewScreen } from "../hooks/useInterviewScreen";
import type { InterviewPending } from "../hooks/useInterviewSession";
import { ANSWER_MAX_LENGTH } from "../options";
import type { AnswerReview, InterviewQuestion } from "../types";
import { BadgeRow, BulletList, StageBadge, StagePanel, SubHeading } from "./StagePanel";

interface ReviewStageProps {
  review: AnswerReview;
  question: InterviewQuestion;
  edit: InterviewScreen["review"];
  pending: InterviewPending;
}

type ScoreKey = "overallScore" | "technicalAccuracy" | "completeness" | "clarityScore" | "depthScore";

const SCORE_ROWS: Array<{ key: ScoreKey; label: string }> = [
  { key: "overallScore", label: "Overall" },
  { key: "technicalAccuracy", label: "Technical accuracy" },
  { key: "completeness", label: "Completeness" },
  { key: "clarityScore", label: "Clarity" },
  { key: "depthScore", label: "Depth" },
];

export function ReviewStage({ review, question, edit, pending }: ReviewStageProps) {
  const colors = useThemeColors();
  const busy = pending !== null;

  const actions = edit.editing ? (
    <ActionButton label="Cancel" variant="outline" onPress={edit.cancel} />
  ) : (
    <ActionButton label="Edit answer" icon={Pencil} variant="outline" disabled={busy} onPress={edit.startEdit} />
  );

  return (
    <StagePanel
      label="Reviewer feedback"
      hint={`Recommendation: ${review.recommendation}`}
      isPending={pending === "review"}
      pendingLabel="Scoring again…"
      actions={actions}
    >
      <View style={styles.scores}>
        {SCORE_ROWS.map(({ key, label }) => {
          const value = review[key];
          const isOverall = key === "overallScore";
          return (
            <View key={key} style={styles.scoreRow}>
              <View style={styles.scoreLabelRow}>
                <Text style={[isOverall ? styles.overallLabel : styles.scoreLabel, { color: colors.foreground }]}>
                  {label}
                </Text>
                <Text style={[isOverall ? styles.overallValue : styles.scoreValue, { color: colors.foreground }]}>
                  {value.toFixed(1)}
                  <Text style={[styles.outOf, { color: colors.mutedForeground }]}>/10</Text>
                </Text>
              </View>
              {!isOverall ? (
                <View style={[styles.track, { backgroundColor: colors.muted }]}>
                  <View style={[styles.fill, { backgroundColor: colors.primary, width: `${Math.min(100, (value / 10) * 100)}%` }]} />
                </View>
              ) : null}
            </View>
          );
        })}
      </View>

      {question.evaluationCriteria ? (
        <>
          <SubHeading>How this answer was judged</SubHeading>
          <Text style={[styles.criteria, { color: colors.mutedForeground }]}>{question.evaluationCriteria}</Text>
        </>
      ) : null}
      {question.redFlags.length > 0 ? (
        <>
          <SubHeading>Red flags to watch for</SubHeading>
          <BulletList items={question.redFlags} />
        </>
      ) : null}

      <SubHeading>Strengths</SubHeading>
      <BulletList items={review.strengths} />
      <SubHeading>Weaknesses</SubHeading>
      <BulletList items={review.weaknesses} />
      <SubHeading>Missed keywords</SubHeading>
      <BulletList items={review.missedKeywords} />
      <SubHeading>Weak topics identified</SubHeading>
      <BulletList items={review.weakTopicsIdentified} />

      {review.redFlagsDetected.length > 0 ? (
        <ResultCallout icon={Flag} title="Red flags detected" tone="rose">
          <BulletList items={review.redFlagsDetected} />
        </ResultCallout>
      ) : null}

      {review.followUpSuggestion ? (
        <BadgeRow>
          <StageBadge label="follow-up" tone="sky" />
          <Text style={[styles.followUp, { color: colors.mutedForeground }]}>{review.followUpSuggestion}</Text>
        </BadgeRow>
      ) : null}

      {review.improvedAnswer ? (
        <ResultCallout icon={Lightbulb} title="How an ideal answer looks" tone="emerald">
          <MarkdownText content={review.improvedAnswer} />
          <ListenButton text={review.improvedAnswer} label="Ideal answer" />
        </ResultCallout>
      ) : null}

      {edit.editing ? (
        <View style={[styles.editBox, { borderTopColor: colors.border }]}>
          <TextField
            label="Your answer"
            value={edit.draft}
            onChangeText={edit.setDraft}
            editable={!busy}
            maxLength={ANSWER_MAX_LENGTH}
            multiline
            voice
          />
        </View>
      ) : null}
    </StagePanel>
  );
}

const styles = StyleSheet.create({
  scores: {
    gap: spacing.md,
  },
  scoreRow: {
    gap: spacing.xs,
  },
  scoreLabelRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  overallLabel: {
    fontSize: 16,
    fontWeight: "700",
  },
  overallValue: {
    fontSize: 22,
    fontWeight: "700",
  },
  scoreLabel: {
    fontSize: 14,
  },
  scoreValue: {
    fontSize: 14,
    fontWeight: "600",
  },
  outOf: {
    fontSize: 12,
    fontWeight: "400",
  },
  track: {
    height: 6,
    borderRadius: radius.full,
    overflow: "hidden",
  },
  fill: {
    height: "100%",
  },
  criteria: {
    fontSize: 14,
    lineHeight: 20,
  },
  followUp: {
    flexShrink: 1,
    fontSize: 14,
    lineHeight: 20,
  },
  editBox: {
    borderTopWidth: 1,
    paddingTop: spacing.md,
  },
});

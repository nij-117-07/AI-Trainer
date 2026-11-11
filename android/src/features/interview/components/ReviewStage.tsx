// src/features/interview/components/ReviewStage.tsx
/**
 * Step 4: the reviewer's verdict. The score, strengths and what to improve come first. The score
 * breakdown, details, the candidate's answer and an ideal answer sit under reveals. The footer holds
 * Track progress (or Re-review answer while editing). The title row holds the edit pencil.
 */
import { StyleSheet, Text, View } from "react-native";
import { Check, Flag, Pencil, X } from "lucide-react-native";
import { shape, spacing, typeScale, useThemeColors } from "@/theme";
import { TextField } from "@/components/tool/FormControls";
import { ListenButton } from "@/components/tool/ListenButton";
import { MarkdownText } from "@/components/tool/MarkdownText";
import { ResultCallout } from "@/components/tool/ResultCallout";
import type { InterviewScreen } from "../hooks/useInterviewScreen";
import type { InterviewPending } from "../hooks/useInterviewSession";
import { ANSWER_MAX_LENGTH } from "../options";
import type { AnswerReview, InterviewQuestion, Recommendation } from "../types";
import { BulletList, IconAction, ListBlock, Reveal, StageBadge, StagePanel, SubHeading } from "./StagePanel";

interface ReviewStageProps {
  review: AnswerReview;
  question: InterviewQuestion;
  answer: string;
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

const RECOMMENDATION_LABELS: Record<Recommendation, string> = {
  move_on: "Move on",
  follow_up: "Ask a follow-up",
  switch_topic: "Switch topic",
};

export function ReviewStage({ review, question, answer, edit, pending }: ReviewStageProps) {
  const colors = useThemeColors();
  const busy = pending !== null;
  const detailScores = SCORE_ROWS.filter(({ key }) => key !== "overallScore");
  const scoreSummary = detailScores.map(({ key, label }) => `${label} ${review[key].toFixed(1)}`).join(" · ");
  const answerPreview = answer.trim().replace(/\s+/g, " ");

  return (
    <StagePanel
      label="Reviewer feedback"
      isPending={pending === "review"}
      pendingLabel="Scoring again…"
      trailing={
        edit.editing ? (
          <IconAction icon={X} label="Cancel editing answer" onPress={edit.cancel} />
        ) : (
          <IconAction icon={Pencil} label="Edit answer" disabled={busy} onPress={edit.startEdit} />
        )
      }
    >
      <View style={styles.headline}>
        <Text style={[styles.overall, { color: colors.foreground }]}>
          {review.overallScore.toFixed(1)}
          <Text style={[styles.outOf, { color: colors.mutedForeground }]}>/10 overall</Text>
        </Text>
        <StageBadge label={RECOMMENDATION_LABELS[review.recommendation] ?? review.recommendation} tone="sky" />
      </View>

      <ListBlock title="Strengths" items={review.strengths} icon={Check} tone="emerald" />
      <ListBlock title="To improve" items={review.weaknesses} icon={X} tone="rose" />

      {review.redFlagsDetected.length > 0 ? (
        <ResultCallout icon={Flag} title="Red flags detected" tone="rose">
          <BulletList items={review.redFlagsDetected} />
        </ResultCallout>
      ) : null}

      <Reveal title="Your answer" summary={answerPreview} open={edit.editing}>
        {edit.editing ? (
          <TextField
            label="Answer"
            value={edit.draft}
            onChangeText={edit.setDraft}
            editable={!busy}
            maxLength={ANSWER_MAX_LENGTH}
            multiline
            voice
          />
        ) : (
          <Text style={[styles.body, { color: colors.foreground }]}>{answer}</Text>
        )}
      </Reveal>

      <Reveal title="Score breakdown" summary={scoreSummary}>
        <View style={styles.scores}>
          {detailScores.map(({ key, label }) => {
            const value = review[key];
            return (
              <View key={key} style={styles.scoreRow}>
                <View style={styles.scoreLabelRow}>
                  <Text style={[styles.body, { color: colors.foreground }]}>{label}</Text>
                  <Text style={[styles.scoreValue, { color: colors.foreground }]}>{value.toFixed(1)}/10</Text>
                </View>
                <View style={[styles.track, { backgroundColor: colors.muted }]}>
                  <View style={[styles.fill, { backgroundColor: colors.primary, width: `${Math.min(100, (value / 10) * 100)}%` }]} />
                </View>
              </View>
            );
          })}
        </View>
      </Reveal>

      <Reveal title="Details" summary="Criteria, missed keywords, follow-up">
        {question.evaluationCriteria ? (
          <View style={styles.block}>
            <SubHeading>How this answer was judged</SubHeading>
            <Text style={[styles.body, { color: colors.mutedForeground }]}>{question.evaluationCriteria}</Text>
          </View>
        ) : null}
        <ListBlock title="Red flags to watch for" items={question.redFlags} />
        <ListBlock title="Missed keywords" items={review.missedKeywords} />
        <ListBlock title="Weak topics identified" items={review.weakTopicsIdentified} />
        {review.followUpSuggestion ? (
          <View style={styles.block}>
            <SubHeading>Likely follow-up</SubHeading>
            <Text style={[styles.body, { color: colors.foreground }]}>{review.followUpSuggestion}</Text>
          </View>
        ) : null}
      </Reveal>

      {review.improvedAnswer ? (
        <Reveal title="How an ideal answer looks">
          <MarkdownText content={review.improvedAnswer} />
          <ListenButton text={review.improvedAnswer} label="Ideal answer" />
        </Reveal>
      ) : null}
    </StagePanel>
  );
}

const styles = StyleSheet.create({
  headline: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    flexWrap: "wrap",
    gap: spacing.sm,
  },
  overall: {
    ...typeScale.title,
    fontWeight: "700",
  },
  outOf: {
    ...typeScale.caption,
    fontWeight: "400",
  },
  body: {
    ...typeScale.body,
  },
  block: {
    gap: spacing.xs,
  },
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
  scoreValue: {
    ...typeScale.body,
    fontWeight: "600",
  },
  track: {
    height: 6,
    borderRadius: shape.full,
    overflow: "hidden",
  },
  fill: {
    height: "100%",
  },
});

// src/features/interview/components/ReviewStage.tsx
/**
 * Step 4: the reviewer's scores and feedback. Gate: Track progress, or Edit the answer and re-review.
 */
import { useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { Flag, Lightbulb, Pencil, RotateCcw, StepForward } from "lucide-react-native";
import { radius, spacing, useThemeColors } from "@/theme";
import { ActionButton, TextField } from "@/components/tool/FormControls";
import { MarkdownText } from "@/components/tool/MarkdownText";
import { ResultCallout } from "@/components/tool/ResultCallout";
import { ANSWER_MAX_LENGTH } from "../options";
import type { AnswerReview } from "../types";
import { useSyncedDraft } from "../hooks/useSyncedDraft";
import { BadgeRow, BulletList, StageBadge, StagePanel, SubHeading } from "./StagePanel";

interface ReviewStageProps {
  review: AnswerReview;
  submittedAnswer: string;
  isPending: boolean;
  error: string | null;
  onProceed: () => void;
  onReReview: (answer: string) => void;
}

type ScoreKey = "overallScore" | "technicalAccuracy" | "completeness" | "clarityScore" | "depthScore";

const SCORE_ROWS: Array<{ key: ScoreKey; label: string }> = [
  { key: "overallScore", label: "Overall" },
  { key: "technicalAccuracy", label: "Technical accuracy" },
  { key: "completeness", label: "Completeness" },
  { key: "clarityScore", label: "Clarity" },
  { key: "depthScore", label: "Depth" },
];

export function ReviewStage({ review, submittedAnswer, isPending, error, onProceed, onReReview }: ReviewStageProps) {
  const colors = useThemeColors();
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useSyncedDraft(submittedAnswer);

  const actions = editing ? (
    <>
      <ActionButton
        label="Re-review"
        icon={RotateCcw}
        loading={isPending}
        onPress={() => {
          const text = draft.trim();
          if (!text) return;
          onReReview(text);
          setEditing(false);
        }}
      />
      <ActionButton
        label="Cancel"
        variant="outline"
        onPress={() => {
          setDraft(submittedAnswer);
          setEditing(false);
        }}
      />
    </>
  ) : (
    <>
      <ActionButton label="Track progress" icon={StepForward} loading={isPending} onPress={onProceed} />
      <ActionButton label="Edit answer" icon={Pencil} variant="outline" onPress={() => setEditing(true)} />
    </>
  );

  return (
    <StagePanel
      step="Step 4"
      label="Reviewer feedback"
      hint={`Recommendation: ${review.recommendation}`}
      isPending={isPending}
      pendingLabel="Scoring again…"
      error={error}
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
        </ResultCallout>
      ) : null}

      {editing ? (
        <View style={[styles.editBox, { borderTopColor: colors.border }]}>
          <TextField
            label="Your answer"
            value={draft}
            onChangeText={setDraft}
            editable={!isPending}
            maxLength={ANSWER_MAX_LENGTH}
            multiline
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

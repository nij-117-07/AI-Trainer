// src/features/puzzle/components/PuzzleRoundView.tsx
/**
 * One puzzle round: the puzzle and its cognitive trigger, the attempts so far, the latest
 * evaluation with feedback and a nudge, and the answer box until the puzzle is solved.
 */
import { useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { CircleCheck, CircleX, Eye, Lightbulb, RefreshCcw, Sparkles, Target, Trophy } from "lucide-react-native";
import { radius, spacing, useThemeColors } from "@/theme";
import { ActionButton, ErrorText, Panel, TextField } from "@/components/tool/FormControls";
import { ListenButton } from "@/components/tool/ListenButton";
import { MarkdownText } from "@/components/tool/MarkdownText";
import { ResultCallout } from "@/components/tool/ResultCallout";
import { SectionTitle } from "@/components/tool/SectionTitle";
import type { PuzzleRound } from "../types";
import { ANSWER_MAX } from "../lib/validate";

interface PuzzleRoundViewProps {
  round: PuzzleRound;
  isPending: boolean;
  error: string | null;
  onAnswerChange: (answer: string) => void;
  onSubmit: () => void;
}

export function PuzzleRoundView({ round, isPending, error, onAnswerChange, onSubmit }: PuzzleRoundViewProps) {
  const colors = useThemeColors();
  const [showSolution, setShowSolution] = useState(false);
  const { puzzle, attempts } = round;
  const latest = attempts.length > 0 ? attempts[attempts.length - 1] : null;
  const solved = latest?.evaluation.isCorrect ?? false;
  const accuracyPct = latest ? Math.round(latest.evaluation.accuracyScore * 100) : 0;

  return (
    <>
      <Panel>
        {puzzle.puzzlerPersona !== "" && (
          <Text style={[styles.persona, { color: colors.mutedForeground }]}>{puzzle.puzzlerPersona}</Text>
        )}
        <MarkdownText content={puzzle.puzzleText} />
        <ListenButton text={puzzle.puzzleText} label="Puzzle" />
        <ResultCallout icon={Lightbulb} title="Cognitive trigger" tone="amber">
          <MarkdownText content={puzzle.cognitiveTrigger || "Nothing was returned."} />
        </ResultCallout>
      </Panel>

      {attempts.length > 0 && (
        <Panel>
          <SectionTitle icon={Target} title="Your attempts" />
          {attempts.map((attempt, index) => {
            const correct = attempt.evaluation.isCorrect;
            const pct = Math.round(attempt.evaluation.accuracyScore * 100);
            const tone = correct ? colors.tone.emerald : colors.tone.rose;
            return (
              <View
                key={`${index}-${attempt.answer}`}
                style={[
                  styles.attempt,
                  { borderColor: correct ? colors.tone.emerald.border : colors.border, backgroundColor: correct ? colors.tone.emerald.bg : colors.muted },
                ]}
              >
                <View style={[styles.attemptNumber, { backgroundColor: colors.card }]}>
                  <Text style={[styles.attemptNumberText, { color: colors.foreground }]}>{index + 1}</Text>
                </View>
                {correct ? <CircleCheck size={18} color={tone.fg} /> : <CircleX size={18} color={tone.fg} />}
                <Text style={[styles.attemptAnswer, { color: colors.foreground }]} numberOfLines={1}>
                  {attempt.answer}
                </Text>
                <Text style={[styles.attemptScore, { color: colors.mutedForeground }]}>{correct ? "Correct" : `${pct}%`}</Text>
              </View>
            );
          })}
        </Panel>
      )}

      {latest && (
        <Panel>
          <View style={styles.verdictRow}>
            <View
              style={[
                styles.verdict,
                solved
                  ? { backgroundColor: colors.tone.emerald.bg, borderColor: colors.tone.emerald.border }
                  : { backgroundColor: colors.tone.rose.bg, borderColor: colors.tone.rose.border },
              ]}
            >
              {solved ? <CircleCheck size={16} color={colors.tone.emerald.fg} /> : <CircleX size={16} color={colors.tone.rose.fg} />}
              <Text style={[styles.verdictText, { color: solved ? colors.tone.emerald.fg : colors.tone.rose.fg }]}>
                {solved ? "Correct!" : "Not quite"}
              </Text>
            </View>
            <Text style={[styles.accuracy, { color: colors.foreground }]}>Accuracy: {accuracyPct}%</Text>
          </View>

          <SectionTitle icon={Sparkles} title="Feedback" />
          <MarkdownText content={latest.evaluation.evaluationFeedback || "Nothing was returned."} />
          <ListenButton text={latest.evaluation.evaluationFeedback} label="Feedback" />

          {latest.evaluation.hintRedirection && (
            <ResultCallout icon={Target} title="Nudge toward the right path" tone="sky">
              <MarkdownText content={latest.evaluation.hintRedirection} />
              <ListenButton text={latest.evaluation.hintRedirection} label="Nudge" />
            </ResultCallout>
          )}
          <ResultCallout icon={Lightbulb} title="Rethink it" tone="amber">
            <MarkdownText content={latest.evaluation.metacognitivePrompt || "Nothing was returned."} />
            <ListenButton text={latest.evaluation.metacognitivePrompt} label="Rethink" />
          </ResultCallout>

          <ActionButton
            label={showSolution ? "Hide solution" : "Reveal solution"}
            icon={Eye}
            variant="outline"
            onPress={() => setShowSolution((value) => !value)}
          />
          {showSolution && (
            <ResultCallout icon={CircleCheck} title="Solution & breakdown" tone="emerald">
              <MarkdownText content={puzzle.solution || "Nothing was returned."} />
              <ListenButton text={puzzle.solution} label="Solution" />
            </ResultCallout>
          )}
        </Panel>
      )}

      {solved ? (
        <ResultCallout icon={Trophy} title="Solved" tone="emerald">
          <Text style={[styles.solvedText, { color: colors.foreground }]}>
            Solved in {attempts.length} {attempts.length === 1 ? "attempt" : "attempts"} — nice work!
          </Text>
        </ResultCallout>
      ) : (
        <Panel>
          <TextField
            label="Your answer"
            placeholder={attempts.length > 0 ? "Try a different answer…" : "Your answer…"}
            value={round.userAnswer}
            onChangeText={onAnswerChange}
            editable={!isPending}
            maxLength={ANSWER_MAX}
            multiline
            voice
          />
          <ErrorText message={error} />
          <ActionButton
            label={isPending ? "Evaluating…" : attempts.length > 0 ? "Check again" : "Submit answer"}
            icon={attempts.length > 0 ? RefreshCcw : CircleCheck}
            loading={isPending}
            onPress={() => {
              if (round.userAnswer.trim()) onSubmit();
            }}
          />
        </Panel>
      )}
    </>
  );
}

const styles = StyleSheet.create({
  persona: {
    fontSize: 14,
    fontStyle: "italic",
    lineHeight: 20,
  },
  attempt: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    borderWidth: 1,
    borderRadius: radius.lg,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  attemptNumber: {
    width: 22,
    height: 22,
    borderRadius: radius.full,
    alignItems: "center",
    justifyContent: "center",
  },
  attemptNumberText: {
    fontSize: 12,
    fontWeight: "700",
  },
  attemptAnswer: {
    flex: 1,
    fontSize: 14,
  },
  attemptScore: {
    fontSize: 12,
  },
  verdictRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
    gap: spacing.md,
  },
  verdict: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    borderWidth: 1,
    borderRadius: radius.full,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
  },
  verdictText: {
    fontSize: 14,
    fontWeight: "600",
  },
  accuracy: {
    fontSize: 14,
    fontWeight: "500",
  },
  solvedText: {
    fontSize: 15,
    fontWeight: "500",
  },
});

/**
 * The active puzzle in the page body: the puzzle, the attempts so far, and the latest feedback.
 * The hint and the solution are hidden until the user asks for them. The answer box is in the
 * screen footer.
 */
import { useEffect, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { CircleCheck, CircleX, Eye, EyeOff, Lightbulb, Target } from "lucide-react-native";
import { shape, spacing, typeScale, useThemeColors } from "@/theme";
import { ActionButton, Panel } from "@/components/tool/FormControls";
import { ListenButton } from "@/components/tool/ListenButton";
import { MarkdownText } from "@/components/tool/MarkdownText";
import { ResultCallout } from "@/components/tool/ResultCallout";
import { SectionTitle } from "@/components/tool/SectionTitle";
import { useToolScroll } from "@/components/tool/ToolScrollContext";
import type { PuzzleRound } from "../types";

interface PuzzleRoundViewProps {
  round: PuzzleRound;
}

export function PuzzleRoundView({ round }: PuzzleRoundViewProps) {
  const colors = useThemeColors();
  const scroll = useToolScroll();
  const [showHint, setShowHint] = useState(false);
  const [showSolution, setShowSolution] = useState(false);
  const { puzzle, attempts } = round;
  const latest = attempts.length > 0 ? attempts[attempts.length - 1] : null;
  const solved = latest?.evaluation.isCorrect ?? false;
  const accuracyPct = latest ? Math.round(latest.evaluation.accuracyScore * 100) : 0;
  const nudge = latest?.evaluation.hintRedirection ?? null;

  useEffect(() => {
    scroll?.current?.scrollToEnd({ animated: true });
  }, [attempts.length, scroll]);

  return (
    <>
      <Panel>
        {puzzle.puzzlerPersona !== "" && (
          <Text style={[styles.persona, { color: colors.mutedForeground }]}>{puzzle.puzzlerPersona}</Text>
        )}
        <MarkdownText content={puzzle.puzzleText} />
        <ListenButton text={puzzle.puzzleText} label="Puzzle" />
        {!solved && !showHint && (
          <ActionButton label="Hint" icon={Lightbulb} variant="outline" onPress={() => setShowHint(true)} />
        )}
        {showHint && (
          <ResultCallout icon={Lightbulb} title="Hint" tone="amber">
            {puzzle.cognitiveTrigger !== "" && <MarkdownText content={puzzle.cognitiveTrigger} />}
            {nudge && <MarkdownText content={nudge} />}
            <ListenButton text={[puzzle.cognitiveTrigger, nudge ?? ""].join(" ")} label="Hint" />
          </ResultCallout>
        )}
      </Panel>

      {attempts.length > 0 && (
        <Panel>
          <SectionTitle icon={Target} title="Your attempts" />
          {attempts.map((attempt, index) => {
            const correct = attempt.evaluation.isCorrect;
            const pct = Math.round(attempt.evaluation.accuracyScore * 100);
            const Icon = correct ? CircleCheck : CircleX;
            return (
              <View
                key={`${index}-${attempt.answer}`}
                accessible
                accessibilityLabel={`Attempt ${index + 1}: ${attempt.answer}. ${correct ? "Correct" : `${pct}% accurate`}`}
                style={[styles.attempt, { borderColor: colors.border, backgroundColor: colors.background }]}
              >
                <Text style={[styles.attemptNumber, { color: colors.mutedForeground }]}>{index + 1}</Text>
                <Icon size={16} color={correct ? colors.foreground : colors.destructive} />
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
            {solved ? (
              <CircleCheck size={18} color={colors.foreground} />
            ) : (
              <CircleX size={18} color={colors.destructive} />
            )}
            <Text
              accessibilityLiveRegion="polite"
              accessibilityRole="header"
              style={[styles.verdictText, { color: colors.foreground }]}
            >
              {solved
                ? `Correct! Solved in ${attempts.length} ${attempts.length === 1 ? "attempt" : "attempts"}.`
                : "Not quite. Try again."}
            </Text>
          </View>
          <Text style={[styles.accuracy, { color: colors.mutedForeground }]}>Accuracy: {accuracyPct}%</Text>

          <MarkdownText content={latest.evaluation.evaluationFeedback || "Nothing was returned."} />
          <ListenButton text={latest.evaluation.evaluationFeedback} label="Feedback" />

          <ResultCallout icon={Target} title="Rethink it" tone="sky">
            <MarkdownText content={latest.evaluation.metacognitivePrompt || "Nothing was returned."} />
            <ListenButton text={latest.evaluation.metacognitivePrompt} label="Rethink" />
          </ResultCallout>

          <ActionButton
            label={showSolution ? "Hide solution" : "Reveal solution"}
            icon={showSolution ? EyeOff : Eye}
            variant="outline"
            onPress={() => setShowSolution((value) => !value)}
          />
          {showSolution && (
            <ResultCallout icon={CircleCheck} title="Solution and breakdown" tone="emerald">
              <MarkdownText content={puzzle.solution || "Nothing was returned."} />
              <ListenButton text={puzzle.solution} label="Solution" />
            </ResultCallout>
          )}
        </Panel>
      )}
    </>
  );
}

const styles = StyleSheet.create({
  persona: {
    ...typeScale.body,
    fontStyle: "italic",
  },
  attempt: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    borderWidth: 1,
    borderRadius: shape.lg,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  attemptNumber: {
    ...typeScale.caption,
    fontWeight: "700",
    minWidth: 14,
  },
  attemptAnswer: {
    ...typeScale.body,
    flex: 1,
  },
  attemptScore: {
    ...typeScale.caption,
  },
  verdictRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  verdictText: {
    ...typeScale.title,
    flexShrink: 1,
  },
  accuracy: {
    ...typeScale.caption,
  },
});

// src/features/puzzle/components/PuzzleRoundView.tsx
/**
 * The active puzzle in the page body: the puzzle and its cognitive trigger, the attempts so far,
 * and the latest evaluation with feedback and a nudge. The solution is hidden until the user asks
 * for it. The answer box is in the screen footer.
 */
import { useEffect, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { CircleCheck, CircleX, Eye, EyeOff, Lightbulb, Sparkles, Target, Trophy } from "lucide-react-native";
import { radius, spacing, useThemeColors } from "@/theme";
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
  const [showSolution, setShowSolution] = useState(false);
  const { puzzle, attempts } = round;
  const latest = attempts.length > 0 ? attempts[attempts.length - 1] : null;
  const solved = latest?.evaluation.isCorrect ?? false;
  const accuracyPct = latest ? Math.round(latest.evaluation.accuracyScore * 100) : 0;

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
            const Icon = correct ? CircleCheck : CircleX;
            return (
              <View
                key={`${index}-${attempt.answer}`}
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
              <CircleCheck size={16} color={colors.foreground} />
            ) : (
              <CircleX size={16} color={colors.destructive} />
            )}
            <Text style={[styles.verdictText, { color: colors.foreground }]}>{solved ? "Correct!" : "Not quite"}</Text>
            <Text style={[styles.accuracy, { color: colors.mutedForeground }]}>Accuracy: {accuracyPct}%</Text>
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
            icon={showSolution ? EyeOff : Eye}
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
      ) : null}
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
    fontSize: 13,
    fontWeight: "700",
    minWidth: 14,
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
    gap: spacing.sm,
  },
  verdictText: {
    fontSize: 16,
    fontWeight: "700",
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

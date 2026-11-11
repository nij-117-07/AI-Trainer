// src/features/riddle/components/RiddleRoundView.tsx
/**
 * The active riddle in the page body: the puzzle, the user's attempts, and the latest feedback.
 * The hint and the solution are shown only when the user asks for them, or once the riddle is solved.
 * The answer box is in the screen footer.
 */
import { useEffect, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { Brain, CircleCheck, CircleX, Compass, Eye, EyeOff, Lightbulb, MessageSquare, Target } from "lucide-react-native";
import { shape, spacing, touchTarget, typeScale, useThemeColors } from "@/theme";
import { ActionButton, Panel } from "@/components/tool/FormControls";
import { ListenButton } from "@/components/tool/ListenButton";
import { MarkdownText } from "@/components/tool/MarkdownText";
import { ResultCallout } from "@/components/tool/ResultCallout";
import { useToolScroll } from "@/components/tool/ToolScrollContext";
import type { RiddleRound } from "../types";

interface RiddleRoundViewProps {
  round: RiddleRound;
  showSolution: boolean;
  onToggleSolution: () => void;
}

export function RiddleRoundView({ round, showSolution, onToggleSolution }: RiddleRoundViewProps) {
  const colors = useThemeColors();
  const scroll = useToolScroll();
  const [hintOpen, setHintOpen] = useState(false);
  const { riddle, attempts } = round;
  const latest = attempts.length > 0 ? attempts[attempts.length - 1] : null;
  const solved = latest?.evaluation.isCorrect ?? false;
  const solutionOpen = showSolution || solved;

  useEffect(() => {
    scroll?.current?.scrollToEnd({ animated: true });
  }, [attempts.length, scroll]);

  return (
    <>
      <Panel>
        <View style={styles.riddleRow}>
          <Brain size={20} color={colors.primary} />
          <View style={styles.flex}>
            <MarkdownText content={riddle.riddleText} />
          </View>
        </View>
        <ListenButton text={riddle.riddleText} label="Riddle" />
        {hintOpen ? (
          <ResultCallout icon={Lightbulb} title="Hint" tone="amber">
            <Text style={[styles.body, { color: colors.foreground }]}>{riddle.cognitiveTrigger}</Text>
          </ResultCallout>
        ) : !solved ? (
          <ActionButton label="Hint" icon={Lightbulb} variant="outline" onPress={() => setHintOpen(true)} />
        ) : null}
      </Panel>

      {attempts.length > 0 && (
        <Panel>
          <Text accessibilityRole="header" style={[styles.heading, { color: colors.foreground }]}>
            Your attempts
          </Text>
          <View style={styles.attempts}>
            {attempts.map((attempt, index) => {
              const correct = attempt.evaluation.isCorrect;
              const Icon = correct ? CircleCheck : CircleX;
              return (
                <View
                  key={`${index}-${attempt.answer}`}
                  accessible
                  accessibilityLabel={`Attempt ${index + 1}: ${attempt.answer}. ${correct ? "Correct" : "Not quite"}`}
                  style={[styles.attempt, { borderColor: colors.border, backgroundColor: colors.background }]}
                >
                  <Text style={[styles.attemptNumber, { color: colors.mutedForeground }]}>{index + 1}</Text>
                  <Icon size={18} color={correct ? colors.tone.emerald.fg : colors.destructive} />
                  <Text style={[styles.attemptText, { color: colors.foreground }]} numberOfLines={2}>
                    {attempt.answer}
                  </Text>
                  <Text style={[styles.attemptStatus, { color: colors.mutedForeground }]}>
                    {correct ? "Correct" : "Not quite"}
                  </Text>
                </View>
              );
            })}
          </View>
        </Panel>
      )}

      {latest && (
        <Panel>
          <View style={styles.verdictRow}>
            {solved ? <CircleCheck size={22} color={colors.tone.emerald.fg} /> : <CircleX size={22} color={colors.destructive} />}
            <Text
              accessibilityLiveRegion="polite"
              accessibilityRole="alert"
              style={[styles.verdict, { color: colors.foreground }]}
            >
              {solved
                ? `Correct! Solved in ${attempts.length} ${attempts.length === 1 ? "attempt" : "attempts"}.`
                : "Not quite. Try again."}
            </Text>
          </View>
          <ResultCallout icon={MessageSquare} title="Feedback" tone="sky">
            <MarkdownText content={latest.evaluation.feedback} />
            <ListenButton text={latest.evaluation.feedback} label="Feedback" />
          </ResultCallout>
          <ResultCallout icon={Compass} title="Shift your perspective" tone="rose">
            <Text style={[styles.body, { color: colors.foreground }]}>{latest.evaluation.thoughtRedirection}</Text>
            <ListenButton text={latest.evaluation.thoughtRedirection} label="Perspective" />
          </ResultCallout>
          {!solved && (
            <ActionButton
              label={showSolution ? "Hide solution" : "Reveal solution"}
              icon={showSolution ? EyeOff : Eye}
              variant="outline"
              onPress={onToggleSolution}
            />
          )}
          {solutionOpen && (
            <ResultCallout icon={Target} title="Solution" tone="emerald">
              <MarkdownText content={riddle.solution} />
              <ListenButton text={riddle.solution} label="Solution" />
            </ResultCallout>
          )}
        </Panel>
      )}
    </>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  riddleRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: spacing.md,
  },
  heading: {
    ...typeScale.label,
    fontWeight: "600",
  },
  body: {
    ...typeScale.body,
  },
  attempts: {
    gap: spacing.sm,
  },
  attempt: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    minHeight: touchTarget,
    borderWidth: 1,
    borderRadius: shape.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  attemptNumber: {
    ...typeScale.label,
    minWidth: 14,
  },
  attemptText: {
    ...typeScale.label,
    flex: 1,
  },
  attemptStatus: {
    ...typeScale.label,
  },
  verdictRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  verdict: {
    ...typeScale.title,
    flex: 1,
  },
});

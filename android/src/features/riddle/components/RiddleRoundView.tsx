// src/features/riddle/components/RiddleRoundView.tsx
/**
 * The active riddle: the puzzle, the user's attempts, and the latest feedback. The solution is
 * hidden until the user asks for it. The answer box is in the screen footer.
 */
import { StyleSheet, Text, View } from "react-native";
import { Brain, CircleCheck, CircleX, Compass, Eye, EyeOff, Lightbulb, ListChecks, MessageSquare, Target, Trophy } from "lucide-react-native";
import { radius, spacing, useThemeColors } from "@/theme";
import { ActionButton, Panel } from "@/components/tool/FormControls";
import { ListenButton } from "@/components/tool/ListenButton";
import { MarkdownText } from "@/components/tool/MarkdownText";
import { ResultCallout } from "@/components/tool/ResultCallout";
import { SectionTitle } from "@/components/tool/SectionTitle";
import type { RiddleRound } from "../types";

interface RiddleRoundViewProps {
  round: RiddleRound;
  showSolution: boolean;
  onToggleSolution: () => void;
}

export function RiddleRoundView({ round, showSolution, onToggleSolution }: RiddleRoundViewProps) {
  const colors = useThemeColors();
  const { riddle, attempts } = round;
  const latest = attempts.length > 0 ? attempts[attempts.length - 1] : null;
  const solved = latest?.evaluation.isCorrect ?? false;

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
        <ResultCallout icon={Lightbulb} title="Mental hook being trained" tone="amber">
          <Text style={[styles.body, { color: colors.mutedForeground }]}>{riddle.cognitiveTrigger}</Text>
        </ResultCallout>
      </Panel>

      {attempts.length > 0 && (
        <Panel>
          <SectionTitle icon={ListChecks} title="Your attempts" />
          {attempts.map((attempt, index) => {
            const correct = attempt.evaluation.isCorrect;
            const Icon = correct ? CircleCheck : CircleX;
            const tone = correct ? colors.tone.emerald : colors.tone.rose;
            return (
              <View
                key={`${index}-${attempt.answer}`}
                style={[styles.attempt, { backgroundColor: tone.bg, borderColor: tone.border }]}
              >
                <Text style={[styles.attemptNumber, { color: colors.primary }]}>{index + 1}</Text>
                <Icon size={16} color={tone.fg} />
                <Text style={[styles.attemptText, { color: colors.foreground }]} numberOfLines={2}>
                  {attempt.answer}
                </Text>
                <Text style={[styles.attemptStatus, { color: colors.mutedForeground }]}>
                  {correct ? "Correct" : "Not quite"}
                </Text>
              </View>
            );
          })}
        </Panel>
      )}

      {latest && (
        <Panel>
          <Text style={[styles.verdict, { color: latest.evaluation.isCorrect ? colors.tone.emerald.fg : colors.tone.rose.fg }]}>
            {latest.evaluation.isCorrect ? "Correct!" : "Not quite"}
          </Text>
          <ResultCallout icon={MessageSquare} title="Feedback" tone="sky">
            <MarkdownText content={latest.evaluation.feedback} />
            <ListenButton text={latest.evaluation.feedback} label="Feedback" />
          </ResultCallout>
          <ResultCallout icon={Compass} title="Shift your perspective" tone="rose">
            <Text style={[styles.body, { color: colors.foreground }]}>{latest.evaluation.thoughtRedirection}</Text>
            <ListenButton text={latest.evaluation.thoughtRedirection} label="Perspective" />
          </ResultCallout>
          <ActionButton
            label={showSolution ? "Hide solution" : "Reveal solution"}
            icon={showSolution ? EyeOff : Eye}
            variant="outline"
            onPress={onToggleSolution}
          />
          {showSolution && (
            <ResultCallout icon={Target} title="Solution" tone="emerald">
              <MarkdownText content={riddle.solution} />
              <ListenButton text={riddle.solution} label="Solution" />
            </ResultCallout>
          )}
        </Panel>
      )}

      {solved ? (
        <ResultCallout icon={Trophy} title="Solved" tone="emerald">
          <Text style={[styles.body, { color: colors.foreground }]}>
            Solved in {attempts.length} {attempts.length === 1 ? "attempt" : "attempts"} — nice work!
          </Text>
        </ResultCallout>
      ) : null}
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
  body: {
    fontSize: 14,
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
  attemptText: {
    flex: 1,
    fontSize: 14,
  },
  attemptStatus: {
    fontSize: 12,
  },
  verdict: {
    fontSize: 16,
    fontWeight: "700",
  },
});

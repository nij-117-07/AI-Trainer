// src/features/testing-portal/components/McqQuestionCard.tsx
/**
 * One MCQ with instant right/wrong feedback on option tap, plus "Recheck with AI",
 * which asks the configured model to solve the question.
 */
import { Pressable, StyleSheet, Text, View } from "react-native";
import { CircleCheck, CircleX, ShieldCheck } from "lucide-react-native";
import { radius, spacing, useThemeColors } from "@/theme";
import { useAiSettings } from "@/features/ai-settings/providers/AiSettingsProvider";
import { useRequest } from "../hooks/useRequest";
import { solveMcq } from "../lib/generators";
import { OPTION_KEYS, type McqItem, type OptionKey } from "../types";
import { ActionButton, ErrorText, Panel } from "./FormControls";
import { SolverResultCard } from "./SolverResultCard";

interface McqQuestionCardProps {
  index: number;
  question: McqItem;
  selected?: OptionKey;
  onSelect: (option: OptionKey) => void;
  contextSetting?: string;
}

export function McqQuestionCard({ index, question, selected, onSelect, contextSetting }: McqQuestionCardProps) {
  const colors = useThemeColors();
  const { settings } = useAiSettings();
  const recheck = useRequest(solveMcq);

  const revealed = selected !== undefined;
  const isCorrect = selected === question.correctAnswer;

  return (
    <Panel>
      <View style={styles.header}>
        <View style={[styles.badge, { backgroundColor: colors.tone.sky.bg }]}>
          <Text style={[styles.badgeText, { color: colors.primary }]}>{index + 1}</Text>
        </View>
        <Text style={[styles.question, { color: colors.foreground }]}>{question.questionText}</Text>
      </View>

      {revealed &&
        (isCorrect ? (
          <View style={styles.feedback}>
            <CircleCheck size={16} color={colors.tone.emerald.fg} />
            <Text style={[styles.feedbackText, { color: colors.tone.emerald.fg }]}>
              Correct: {question.correctAnswer}
            </Text>
          </View>
        ) : (
          <View style={styles.feedback}>
            <CircleX size={16} color={colors.destructive} />
            <Text style={[styles.feedbackText, { color: colors.destructive }]}>
              Wrong. Correct answer: {question.correctAnswer}
            </Text>
          </View>
        ))}

      <View style={styles.options}>
        {OPTION_KEYS.map((key) => {
          const isCorrectOption = revealed && key === question.correctAnswer;
          const isWrongPick = revealed && selected === key && key !== question.correctAnswer;
          const borderColor = isCorrectOption
            ? colors.tone.emerald.fg
            : isWrongPick
              ? colors.destructive
              : colors.border;
          return (
            <Pressable
              key={key}
              disabled={revealed}
              onPress={() => onSelect(key)}
              accessibilityRole="button"
              accessibilityLabel={`Option ${key}: ${question.options[key]}`}
              style={({ pressed }) => [
                styles.option,
                { borderColor, backgroundColor: isCorrectOption ? colors.tone.emerald.bg : colors.background },
                pressed && !revealed && { backgroundColor: colors.muted },
              ]}
            >
              <View style={[styles.letter, { borderColor }]}>
                <Text style={[styles.letterText, { color: colors.foreground }]}>{key}</Text>
              </View>
              <Text style={[styles.optionText, { color: colors.foreground }]}>{question.options[key]}</Text>
            </Pressable>
          );
        })}
      </View>

      <View style={[styles.recheck, { borderTopColor: colors.border }]}>
        <ActionButton
          label={recheck.pending ? "Rechecking with AI…" : "Recheck with AI"}
          icon={ShieldCheck}
          variant="outline"
          loading={recheck.pending}
          onPress={() =>
            recheck.run(settings, {
              question: question.questionText,
              context: contextSetting ?? "",
              options: question.options,
            })
          }
        />
        <ErrorText message={recheck.error} />
        {recheck.data && <SolverResultCard result={recheck.data} />}
      </View>
    </Panel>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: spacing.md,
  },
  badge: {
    width: 26,
    height: 26,
    borderRadius: radius.full,
    alignItems: "center",
    justifyContent: "center",
  },
  badgeText: {
    fontSize: 13,
    fontWeight: "700",
  },
  question: {
    flex: 1,
    fontSize: 16,
    lineHeight: 23,
    fontWeight: "500",
  },
  feedback: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  feedbackText: {
    fontSize: 14,
    fontWeight: "600",
  },
  options: {
    gap: spacing.sm,
  },
  option: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    borderWidth: 1,
    borderRadius: radius.lg,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
  },
  letter: {
    width: 26,
    height: 26,
    borderRadius: radius.full,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  letterText: {
    fontSize: 13,
    fontWeight: "600",
  },
  optionText: {
    flex: 1,
    fontSize: 15,
    lineHeight: 21,
  },
  recheck: {
    borderTopWidth: 1,
    paddingTop: spacing.lg,
    gap: spacing.md,
  },
});

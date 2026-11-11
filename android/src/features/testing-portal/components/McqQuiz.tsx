// src/features/testing-portal/components/McqQuiz.tsx
/**
 * Interactive MCQ quiz with a live score. Supports "all questions" and "one by one"
 * modes. Every card stays mounted, so selections and AI rechecks survive mode switches.
 */
import { useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { RefreshCcw, Trophy } from "lucide-react-native";
import { shape, spacing, typeScale, useThemeColors } from "@/theme";
import type { McqItem, OptionKey } from "../types";
import type { McqAnswers } from "../lib/persistence";
import { ActionButton, ChoiceChips, Panel } from "@/components/tool/FormControls";
import { StepNavigator } from "@/components/tool/StepNavigator";
import { McqQuestionCard } from "./McqQuestionCard";

type ViewMode = "list" | "step";

const VIEW_MODES: { value: ViewMode; label: string }[] = [
  { value: "list", label: "All questions" },
  { value: "step", label: "One by one" },
];

interface McqQuizProps {
  questions: McqItem[];
  contextSetting?: string;
  answers: McqAnswers;
  onSelect: (index: number, option: OptionKey) => void;
  onRetry: () => void;
}

export function McqQuiz({ questions, contextSetting, answers, onSelect, onRetry }: McqQuizProps) {
  const colors = useThemeColors();
  const [mode, setMode] = useState<ViewMode>("list");
  const [activeIndex, setActiveIndex] = useState(0);

  const total = questions.length;
  const selectedAt = (index: number) => {
    const answer = answers[index];
    return answer?.checked ? answer.selected : undefined;
  };
  const score = questions.reduce((sum, question, index) => sum + (selectedAt(index) === question.correctAnswer ? 1 : 0), 0);
  const allAnswered = total > 0 && questions.every((_, index) => selectedAt(index) !== undefined);
  const isStep = mode === "step";

  function reset() {
    onRetry();
    setActiveIndex(0);
  }

  return (
    <View style={styles.quiz}>
      <View style={styles.toolbar}>
        <ChoiceChips options={VIEW_MODES} value={mode} onChange={setMode} />
        <View style={[styles.scorePill, { borderColor: colors.border, backgroundColor: colors.card }]}>
          <Text accessibilityLiveRegion="polite" style={[styles.scoreText, { color: colors.foreground }]}>
            Score: {score}/{total}
          </Text>
        </View>
      </View>

      {isStep && (
        <StepNavigator
          index={activeIndex}
          total={total}
          onPrevious={() => setActiveIndex((index) => Math.max(0, index - 1))}
          onNext={() => setActiveIndex((index) => Math.min(total - 1, index + 1))}
        />
      )}

      {questions.map((question, index) => (
        <View key={index} style={{ display: !isStep || index === activeIndex ? "flex" : "none" }}>
          <McqQuestionCard
            index={index}
            question={question}
            selected={selectedAt(index)}
            onSelect={(option) => onSelect(index, option)}
            contextSetting={contextSetting}
          />
        </View>
      ))}

      {allAnswered && (
        <Panel>
          <View style={styles.summary}>
            <Trophy size={20} color={colors.primary} />
            <Text style={[styles.summaryText, { color: colors.foreground }]}>
              You answered {score} of {total} correctly.
            </Text>
          </View>
          <ActionButton label="Retry all questions" icon={RefreshCcw} variant="outline" onPress={reset} />
        </Panel>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  quiz: {
    gap: spacing.lg,
  },
  toolbar: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing.md,
  },
  scorePill: {
    borderWidth: 1,
    borderRadius: shape.full,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  scoreText: {
    ...typeScale.label,
    fontWeight: "600",
  },
  summary: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  summaryText: {
    flex: 1,
    ...typeScale.body,
    fontWeight: "500",
  },
});

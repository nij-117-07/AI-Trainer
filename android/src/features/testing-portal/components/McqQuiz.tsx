// src/features/testing-portal/components/McqQuiz.tsx
/**
 * Interactive MCQ quiz with a live score. Supports "all questions" and "one by one"
 * modes. Every card stays mounted, so selections and AI rechecks survive mode switches.
 */
import { useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { RefreshCcw, Trophy } from "lucide-react-native";
import { radius, spacing, useThemeColors } from "@/theme";
import type { McqItem, OptionKey } from "../types";
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
}

export function McqQuiz({ questions, contextSetting }: McqQuizProps) {
  const colors = useThemeColors();
  const [mode, setMode] = useState<ViewMode>("list");
  const [activeIndex, setActiveIndex] = useState(0);
  const [answers, setAnswers] = useState<Partial<Record<number, OptionKey>>>({});

  const total = questions.length;
  const score = questions.reduce((sum, question, index) => sum + (answers[index] === question.correctAnswer ? 1 : 0), 0);
  const allAnswered = total > 0 && questions.every((_, index) => answers[index] !== undefined);
  const isStep = mode === "step";

  function reset() {
    setAnswers({});
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
            selected={answers[index]}
            onSelect={(option) => setAnswers((prev) => ({ ...prev, [index]: option }))}
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
          <ActionButton label="Try again" icon={RefreshCcw} variant="outline" onPress={reset} />
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
    borderRadius: radius.full,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  scoreText: {
    fontSize: 14,
    fontWeight: "600",
  },
  summary: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  summaryText: {
    flex: 1,
    fontSize: 15,
    fontWeight: "500",
  },
});

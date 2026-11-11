// src/features/testing-portal/components/TheoreticalResultView.tsx
/**
 * The saved theoretical questions. They show one at a time by default, or as a full list. Each
 * question has its own answer box, grading, and model answer (TheoreticalQuestionCard).
 */
import { useState } from "react";
import { StyleSheet, View } from "react-native";
import { spacing } from "@/theme";
import { ChoiceChips } from "@/components/tool/FormControls";
import { ErrorBoundary } from "@/components/tool/ErrorBoundary";
import { StepNavigator } from "@/components/tool/StepNavigator";
import type { TheoreticalItem } from "../types";
import {
  EMPTY_THEORETICAL_ANSWER,
  type TheoreticalAnswer,
  type TheoreticalAnswers,
} from "../lib/persistence";
import { TheoreticalQuestionCard } from "./TheoreticalQuestionCard";

type ViewMode = "list" | "step";

const VIEW_MODES: { value: ViewMode; label: string }[] = [
  { value: "step", label: "One by one" },
  { value: "list", label: "All questions" },
];

interface TheoreticalResultViewProps {
  questions: TheoreticalItem[];
  contextSetting: string;
  difficultyLevel: string;
  answers: TheoreticalAnswers;
  failedIndex: number | null;
  onAnswerChange: (index: number, patch: Partial<TheoreticalAnswer>) => void;
}

export function TheoreticalResultView({
  questions,
  contextSetting,
  difficultyLevel,
  answers,
  failedIndex,
  onAnswerChange,
}: TheoreticalResultViewProps) {
  const [mode, setMode] = useState<ViewMode>("step");
  const [activeIndex, setActiveIndex] = useState(0);
  const isStep = mode === "step";

  return (
    <View style={styles.view}>
      <ChoiceChips options={VIEW_MODES} value={mode} onChange={setMode} />

      {isStep && (
        <StepNavigator
          index={activeIndex}
          total={questions.length}
          onPrevious={() => setActiveIndex((index) => Math.max(0, index - 1))}
          onNext={() => setActiveIndex((index) => Math.min(questions.length - 1, index + 1))}
        />
      )}

      {questions.map((item, index) => (
        <View key={index} style={{ display: !isStep || index === activeIndex ? "flex" : "none" }}>
          <ErrorBoundary label={`Question ${index + 1}`}>
            <TheoreticalQuestionCard
              index={index}
              question={item}
              contextSetting={contextSetting}
              difficultyLevel={difficultyLevel}
              saved={answers[index] ?? EMPTY_THEORETICAL_ANSWER}
              saveFailed={failedIndex === index}
              onChange={(patch) => onAnswerChange(index, patch)}
              onNext={isStep && index < questions.length - 1 ? () => setActiveIndex(index + 1) : undefined}
            />
          </ErrorBoundary>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  view: {
    gap: spacing.lg,
  },
});

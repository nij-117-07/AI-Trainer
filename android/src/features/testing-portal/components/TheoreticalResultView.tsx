// src/features/testing-portal/components/TheoreticalResultView.tsx
/**
 * The saved theoretical questions. They show one at a time by default, or as a full list. Each
 * question has its own answer box, grading, and model answer (TheoreticalQuestionCard).
 */
import { useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { spacing, useThemeColors } from "@/theme";
import { ChoiceChips, Panel } from "@/components/tool/FormControls";
import { ErrorBoundary } from "@/components/tool/ErrorBoundary";
import { StepNavigator } from "@/components/tool/StepNavigator";
import type { TheoreticalItem } from "../types";
import { TheoreticalQuestionCard } from "./TheoreticalQuestionCard";

type ViewMode = "list" | "step";

const VIEW_MODES: { value: ViewMode; label: string }[] = [
  { value: "step", label: "One by one" },
  { value: "list", label: "List" },
];

interface TheoreticalResultViewProps {
  questions: TheoreticalItem[];
  contextSetting: string;
  difficultyLevel: string;
}

export function TheoreticalResultView({ questions, contextSetting, difficultyLevel }: TheoreticalResultViewProps) {
  const colors = useThemeColors();
  const [mode, setMode] = useState<ViewMode>("step");
  const [activeIndex, setActiveIndex] = useState(0);
  const isStep = mode === "step";

  const navigator = isStep ? (
    <StepNavigator
      index={activeIndex}
      total={questions.length}
      onPrevious={() => setActiveIndex((index) => Math.max(0, index - 1))}
      onNext={() => setActiveIndex((index) => Math.min(questions.length - 1, index + 1))}
    />
  ) : null;

  return (
    <View style={styles.view}>
      <Panel>
        <Text style={[styles.count, { color: colors.foreground }]}>
          {questions.length} {questions.length === 1 ? "question" : "questions"}
        </Text>
        <ChoiceChips options={VIEW_MODES} value={mode} onChange={setMode} wrap={false} />
      </Panel>

      {navigator}

      {questions.map((item, index) => (
        <View key={index} style={{ display: !isStep || index === activeIndex ? "flex" : "none" }}>
          <ErrorBoundary label={`Question ${index + 1}`}>
            <TheoreticalQuestionCard
              index={index}
              question={item}
              contextSetting={contextSetting}
              difficultyLevel={difficultyLevel}
              onNext={isStep && index < questions.length - 1 ? () => setActiveIndex(index + 1) : undefined}
            />
          </ErrorBoundary>
        </View>
      ))}

      {navigator}
    </View>
  );
}

const styles = StyleSheet.create({
  view: {
    gap: spacing.lg,
  },
  count: {
    fontSize: 16,
    fontWeight: "600",
  },
});

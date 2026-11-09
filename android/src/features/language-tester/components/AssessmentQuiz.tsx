// src/features/language-tester/components/AssessmentQuiz.tsx
/**
 * Multiple-choice assessment. Pick an answer per question, then check all of them at once to
 * see the score and each explanation. "One by one" shows a single question with Previous/Next.
 */
import { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { Check, RefreshCcw, Trophy, X } from "lucide-react-native";
import { radius, spacing, useThemeColors } from "@/theme";
import { ActionButton, Panel } from "@/components/tool/FormControls";
import { ListenButton } from "@/components/tool/ListenButton";
import { StepNavigator } from "@/components/tool/StepNavigator";
import { OPTION_KEYS, type AssessmentQuestion, type AssessmentResult, type OptionKey } from "../types";
import { EmptyNote, FeedbackBox, QuestionHeading, QuizModeBar, ScorePill, type QuizMode } from "./QuizParts";
import { usePersistedRunState } from "@/hooks/usePersistedRunState";

const STORAGE_KEY = "language-learner.language-tester.assessment.run.v1";

export function AssessmentQuiz({ result }: { result: AssessmentResult }) {
  const colors = useThemeColors();
  const [mode, setMode] = useState<QuizMode>("list");
  const [activeIndex, setActiveIndex] = useState(0);
  const runId = JSON.stringify(result);
  const [answers, setAnswers] = usePersistedRunState<Partial<Record<number, OptionKey>>>(
    `${STORAGE_KEY}.answers`,
    runId,
    {},
  );
  const [checked, setChecked] = usePersistedRunState(`${STORAGE_KEY}.checked`, runId, false);

  const total = result.questions.length;
  const answeredCount = Object.keys(answers).length;
  const score = result.questions.reduce((sum, question, index) => sum + (answers[index] === question.correctAnswer ? 1 : 0), 0);
  const allAnswered = total > 0 && answeredCount === total;

  function choose(index: number, letter: OptionKey) {
    if (checked) return;
    setAnswers((current) => ({ ...current, [index]: letter }));
  }

  function reset() {
    setAnswers({});
    setChecked(false);
    setActiveIndex(0);
  }

  return (
    <View style={styles.quiz}>
      <Panel>
        {result.assessmentTitle !== "" && (
          <Text style={[styles.title, { color: colors.foreground }]}>{result.assessmentTitle}</Text>
        )}
        {result.levelRationale !== "" && (
          <Text style={[styles.rationale, { color: colors.mutedForeground }]}>{result.levelRationale}</Text>
        )}
        <ListenButton text={result.levelRationale} label="Level rationale" />
      </Panel>

      <View style={styles.toolbar}>
        <QuizModeBar mode={mode} onChange={setMode} />
        <ScorePill text={checked ? `Score: ${score}/${total}` : `${answeredCount}/${total} answered`} />
      </View>

      {mode === "step" && total > 0 && (
        <StepNavigator
          index={activeIndex}
          total={total}
          onPrevious={() => setActiveIndex((index) => Math.max(0, index - 1))}
          onNext={() => setActiveIndex((index) => Math.min(total - 1, index + 1))}
        />
      )}

      {total === 0 && <EmptyNote message="No questions were returned. Try generating again." />}

      {result.questions.map((question, index) =>
        mode === "list" || index === activeIndex ? (
          <QuestionCard
            key={index}
            index={index}
            question={question}
            selected={answers[index]}
            checked={checked}
            onSelect={(letter) => choose(index, letter)}
          />
        ) : null,
      )}

      {total > 0 && (
        <Panel>
          {checked ? (
            <View style={styles.summary}>
              <Trophy size={20} color={colors.tone.amber.fg} />
              <Text style={[styles.summaryText, { color: colors.foreground }]}>
                You answered {score} of {total} correctly.
              </Text>
            </View>
          ) : (
            <Text style={[styles.summaryText, { color: colors.mutedForeground }]}>
              {allAnswered ? "All answered. Check to see your score." : "Select an answer for each question, then check."}
            </Text>
          )}
          {checked ? (
            <ActionButton label="Try again" icon={RefreshCcw} variant="outline" onPress={reset} />
          ) : (
            <ActionButton label="Check answers" onPress={() => setChecked(true)} />
          )}
        </Panel>
      )}
    </View>
  );
}

interface QuestionCardProps {
  index: number;
  question: AssessmentQuestion;
  selected: OptionKey | undefined;
  checked: boolean;
  onSelect: (letter: OptionKey) => void;
}

function QuestionCard({ index, question, selected, checked, onSelect }: QuestionCardProps) {
  const colors = useThemeColors();
  const answered = selected !== undefined;
  const isCorrect = selected === question.correctAnswer;

  return (
    <Panel>
      <QuestionHeading index={index} text={question.questionText} />
      <ListenButton text={question.questionText} label="Question" />
      <View style={styles.options}>
        {OPTION_KEYS.map((letter) => {
          const text = question.options[letter];
          if (!text) return null;
          const isSelected = selected === letter;
          const isAnswer = question.correctAnswer === letter;
          const borderColor = checked
            ? isAnswer
              ? colors.tone.emerald.fg
              : isSelected
                ? colors.destructive
                : colors.border
            : isSelected
              ? colors.primary
              : colors.border;
          const backgroundColor = checked && isAnswer
            ? colors.tone.emerald.bg
            : !checked && isSelected
              ? colors.tone.sky.bg
              : colors.background;
          return (
            <Pressable
              key={letter}
              onPress={() => onSelect(letter)}
              disabled={checked}
              accessibilityRole="button"
              accessibilityState={{ selected: isSelected }}
              accessibilityLabel={`Option ${letter}: ${text}`}
              style={({ pressed }) => [
                styles.option,
                { borderColor, backgroundColor },
                pressed && !checked && { backgroundColor: colors.muted },
                checked && !isAnswer && !isSelected && { opacity: 0.6 },
              ]}
            >
              <View style={[styles.letter, { borderColor }]}>
                <Text style={[styles.letterText, { color: colors.foreground }]}>{letter}</Text>
              </View>
              <Text style={[styles.optionText, { color: colors.foreground }]}>{text}</Text>
              {checked && isAnswer && <Check size={16} color={colors.tone.emerald.fg} />}
              {checked && isSelected && !isAnswer && <X size={16} color={colors.destructive} />}
            </Pressable>
          );
        })}
      </View>

      {checked && answered && (
        <FeedbackBox
          tone={isCorrect ? "emerald" : "rose"}
          title={isCorrect ? "Correct" : `Not quite — the answer is ${question.correctAnswer}.`}
        >
          {question.explanation !== "" && (
            <Text style={[styles.explanation, { color: colors.mutedForeground }]}>{question.explanation}</Text>
          )}
          <ListenButton text={question.explanation} label="Explanation" />
        </FeedbackBox>
      )}
    </Panel>
  );
}

const styles = StyleSheet.create({
  quiz: {
    gap: spacing.lg,
  },
  title: {
    fontSize: 18,
    fontWeight: "700",
  },
  rationale: {
    fontSize: 14,
    lineHeight: 21,
  },
  toolbar: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing.md,
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
  explanation: {
    fontSize: 14,
    lineHeight: 20,
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

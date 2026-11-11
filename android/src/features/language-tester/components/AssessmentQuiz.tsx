// src/features/language-tester/components/AssessmentQuiz.tsx
/**
 * Multiple-choice assessment, one question at a time. Pick an option, check it, read the feedback,
 * then go on. After the last question, a summary lists what was right and what to review.
 */
import { useEffect, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { Check, ChevronLeft, ChevronRight, RefreshCcw, Trophy, X, type LucideIcon } from "lucide-react-native";
import { shape, spacing, touchTarget, typeScale, useThemeColors } from "@/theme";
import { ActionButton, ErrorText, Panel, pointerCursor } from "@/components/tool/FormControls";
import { ListenButton } from "@/components/tool/ListenButton";
import { useToolSlots } from "@/components/tool/tool-slots";
import { usePersistedRunState } from "@/hooks/usePersistedRunState";
import { SAVE_FAILED_MESSAGE } from "../lib/persistence";
import { OPTION_KEYS, type AssessmentResult, type OptionKey } from "../types";
import { EmptyNote, FormWidth } from "./QuizParts";

const STORAGE_KEY = "language-learner.language-tester.assessment.run.v1";

export function AssessmentQuiz({ result }: { result: AssessmentResult }) {
  const colors = useThemeColors();
  const slots = useToolSlots();
  const [activeIndex, setActiveIndex] = useState(0);
  const [revealed, setRevealed] = useState<Partial<Record<number, boolean>>>({});
  const runId = JSON.stringify(result);
  const [answers, setAnswers, answersSaveError] = usePersistedRunState<Partial<Record<number, OptionKey>>>(
    `${STORAGE_KEY}.answers`,
    runId,
    {},
  );
  const [finished, setFinished, finishedSaveError] = usePersistedRunState(`${STORAGE_KEY}.checked`, runId, false);
  const saveError = answersSaveError || finishedSaveError;

  const total = result.questions.length;
  const question = result.questions[activeIndex];
  const selected = answers[activeIndex];
  const questionRevealed = finished || revealed[activeIndex] === true;
  const isCorrect = selected !== undefined && selected === question?.correctAnswer;
  const isLast = activeIndex >= total - 1;
  const score = result.questions.reduce((sum, item, index) => sum + (answers[index] === item.correctAnswer ? 1 : 0), 0);

  function choose(letter: OptionKey) {
    if (questionRevealed) return;
    setAnswers((current) => ({ ...current, [activeIndex]: letter }));
  }

  function check() {
    setRevealed((current) => ({ ...current, [activeIndex]: true }));
  }

  function advance() {
    if (isLast) setFinished(true);
    else setActiveIndex((index) => index + 1);
  }

  function move(delta: number) {
    setActiveIndex((index) => Math.min(total - 1, Math.max(0, index + delta)));
  }

  function reset() {
    setAnswers({});
    setRevealed({});
    setFinished(false);
    setActiveIndex(0);
  }

  const feedbackWord = isCorrect ? "Correct" : selected === undefined ? "Not answered" : "Not quite";
  const palette = colors.tone[isCorrect ? "emerald" : "rose"];

  const stageLabel =
    question && !finished ? (
      <Text style={[typeScale.caption, { color: colors.mutedForeground }]}>
        Question {activeIndex + 1} of {total}
      </Text>
    ) : null;

  const footerAction =
    question && !finished ? (
      questionRevealed ? (
        <ActionButton label={isLast ? "See results" : "Next question"} onPress={advance} />
      ) : (
        <ActionButton label="Check answer" disabled={selected === undefined} onPress={check} />
      )
    ) : null;

  useEffect(() => {
    slots?.setHeaderRight(stageLabel);
    return () => slots?.setHeaderRight(null);
  });

  useEffect(() => {
    slots?.setFooter(footerAction);
    return () => slots?.setFooter(null);
  });

  return (
    <FormWidth>
      {result.assessmentTitle !== "" && (
        <Text accessibilityRole="header" style={[typeScale.title, { color: colors.foreground }]}>
          {result.assessmentTitle}
        </Text>
      )}
      {result.levelRationale !== "" && (
        <Text style={[typeScale.body, { color: colors.mutedForeground }]}>{result.levelRationale}</Text>
      )}
      <ListenButton text={result.levelRationale} label="Level rationale" />

      {total === 0 && <EmptyNote message="No questions were returned. Try generating again." />}

      {finished && (
        <Panel>
          <View style={styles.summaryHead}>
            <Trophy size={20} color={colors.tone.amber.fg} />
            <Text accessibilityLiveRegion="polite" style={[typeScale.title, styles.flex, { color: colors.foreground }]}>
              You got {score} of {total} right.
            </Text>
          </View>
          <View style={styles.review}>
            {result.questions.map((item, index) => {
              const correct = answers[index] === item.correctAnswer;
              const word = correct ? "Correct" : answers[index] === undefined ? "Not answered" : "Review";
              const tone = correct ? colors.tone.emerald.fg : colors.destructive;
              return (
                <Pressable
                  key={item.id}
                  onPress={() => setActiveIndex(index)}
                  accessibilityRole="button"
                  accessibilityLabel={`Question ${index + 1}: ${word}`}
                  style={({ pressed }) => [
                    styles.reviewRow,
                    pointerCursor,
                    { borderColor: colors.border },
                    pressed && { backgroundColor: colors.muted },
                  ]}
                >
                  {correct ? <Check size={16} color={tone} /> : <X size={16} color={tone} />}
                  <Text numberOfLines={1} style={[typeScale.body, styles.flex, { color: colors.foreground }]}>
                    {index + 1}. {item.questionText}
                  </Text>
                  <Text style={[typeScale.label, { color: tone }]}>{word}</Text>
                </Pressable>
              );
            })}
          </View>
          <ActionButton label="Retake assessment" icon={RefreshCcw} onPress={reset} />
        </Panel>
      )}

      <ErrorText message={saveError ? SAVE_FAILED_MESSAGE : null} />

      {question && (
        <Panel>
          <View style={styles.nav}>
            <NavButton icon={ChevronLeft} label="Previous question" disabled={activeIndex === 0} onPress={() => move(-1)} />
            <NavButton icon={ChevronRight} label="Show next question" disabled={isLast} onPress={() => move(1)} />
          </View>

          <View style={styles.questionRow}>
            <Text accessibilityRole="header" style={[typeScale.title, styles.flex, { color: colors.foreground }]}>
              {question.questionText}
            </Text>
            <ListenButton text={question.questionText} label="Question" />
          </View>

          <View style={styles.options}>
            {OPTION_KEYS.map((letter) => {
              const text = question.options[letter];
              if (!text) return null;
              const isSelected = selected === letter;
              const isAnswer = question.correctAnswer === letter;
              const borderColor = questionRevealed
                ? isAnswer
                  ? colors.tone.emerald.fg
                  : isSelected
                    ? colors.destructive
                    : colors.border
                : isSelected
                  ? colors.primary
                  : colors.border;
              const backgroundColor = questionRevealed && isAnswer
                ? colors.tone.emerald.bg
                : !questionRevealed && isSelected
                  ? colors.tone.sky.bg
                  : colors.background;
              return (
                <Pressable
                  key={letter}
                  onPress={() => choose(letter)}
                  disabled={questionRevealed}
                  accessibilityRole="radio"
                  accessibilityState={{ checked: isSelected, selected: isSelected, disabled: questionRevealed }}
                  accessibilityLabel={`Option ${letter}: ${text}`}
                  style={({ pressed }) => [
                    styles.option,
                    pointerCursor,
                    { borderColor, backgroundColor },
                    pressed && !questionRevealed && { backgroundColor: colors.muted },
                  ]}
                >
                  <View style={[styles.letter, { borderColor }]}>
                    <Text style={[styles.letterText, { color: colors.foreground }]}>{letter}</Text>
                  </View>
                  <Text style={[typeScale.body, styles.flex, { color: colors.foreground }]}>{text}</Text>
                  {questionRevealed && isAnswer && <Check size={16} color={colors.tone.emerald.fg} />}
                  {questionRevealed && isSelected && !isAnswer && <X size={16} color={colors.destructive} />}
                </Pressable>
              );
            })}
          </View>

          {questionRevealed && (
            <View
              accessibilityLiveRegion="polite"
              style={[styles.feedback, { backgroundColor: palette.bg, borderColor: palette.border }]}
            >
              <View style={styles.feedbackHead}>
                {isCorrect ? <Check size={16} color={palette.fg} /> : <X size={16} color={palette.fg} />}
                <Text style={[typeScale.label, { color: palette.fg }]}>{feedbackWord}</Text>
              </View>
              <Text style={[typeScale.body, { color: colors.foreground }]}>
                Answer: {question.correctAnswer}. {question.options[question.correctAnswer]}
              </Text>
              {question.explanation !== "" && (
                <Text style={[typeScale.body, { color: colors.mutedForeground }]}>{question.explanation}</Text>
              )}
              <ListenButton text={question.explanation} label="Explanation" />
            </View>
          )}

        </Panel>
      )}
    </FormWidth>
  );
}

function NavButton({
  icon: Icon,
  label,
  disabled,
  onPress,
}: {
  icon: LucideIcon;
  label: string;
  disabled: boolean;
  onPress: () => void;
}) {
  const colors = useThemeColors();
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled }}
      style={({ pressed }) => [
        styles.navButton,
        pointerCursor,
        { borderColor: colors.border, opacity: disabled ? 0.4 : 1 },
        pressed && { backgroundColor: colors.muted },
      ]}
    >
      <Icon size={20} color={colors.foreground} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  summaryHead: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  review: {
    gap: spacing.sm,
  },
  reviewRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    minHeight: 48,
    borderWidth: 1,
    borderRadius: shape.lg,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  nav: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing.sm,
  },
  navButton: {
    width: touchTarget,
    height: touchTarget,
    borderRadius: shape.full,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  questionRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: spacing.sm,
  },
  options: {
    gap: spacing.sm,
  },
  option: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    minHeight: 56,
    borderWidth: 1,
    borderRadius: shape.lg,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
  },
  letter: {
    width: 28,
    height: 28,
    borderRadius: shape.full,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  letterText: {
    ...typeScale.label,
    fontWeight: "600",
  },
  feedback: {
    borderWidth: 1,
    borderRadius: shape.lg,
    padding: spacing.lg,
    gap: spacing.sm,
  },
  feedbackHead: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
});

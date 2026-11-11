// src/features/language-tester/components/FibQuiz.tsx
/**
 * Fill-in-the-blank quiz. Each sentence has a typed answer, checked against the model for typos,
 * correctness, and grammar. Feedback stays on the question until the quiz is reset.
 */
import { useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { Check } from "lucide-react-native";
import { spacing, useThemeColors } from "@/theme";
import { useAiSettings } from "@/features/ai-settings/providers/AiSettingsProvider";
import { ActionButton, ErrorText, Panel, TextField } from "@/components/tool/FormControls";
import { CardGrid } from "@/components/tool/CardGrid";
import { ListenButton } from "@/components/tool/ListenButton";
import { StepNavigator } from "@/components/tool/StepNavigator";
import { evaluateFibAnswer } from "../lib/generators";
import { errorMessage } from "../lib/text";
import { useRunSignal } from "../hooks/useRunSignal";
import type { FibEvaluation, FibQuestion, FibResult } from "../types";
import { EmptyNote, FeedbackBox, FormWidth, QuestionHeading, QuizModeBar, ScorePill, type QuizMode } from "./QuizParts";
import { usePersistedRunState } from "@/hooks/usePersistedRunState";

const STORAGE_KEY = "language-learner.language-tester.fib.run.v1";

export function FibQuiz({ result }: { result: FibResult }) {
  const { settings } = useAiSettings();
  const nextSignal = useRunSignal();
  const [mode, setMode] = useState<QuizMode>("list");
  const [activeIndex, setActiveIndex] = useState(0);
  const runId = JSON.stringify(result);
  const [answers, setAnswers] = usePersistedRunState<Record<number, string>>(`${STORAGE_KEY}.answers`, runId, {});
  const [feedback, setFeedback] = usePersistedRunState<Record<number, FibEvaluation>>(
    `${STORAGE_KEY}.feedback`,
    runId,
    {},
  );
  const [pendingIndex, setPendingIndex] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  const total = result.questions.length;
  const checkedCount = Object.keys(feedback).length;

  async function check(index: number) {
    const question = result.questions[index];
    const userAnswer = (answers[index] ?? "").trim();
    if (!question || !userAnswer || pendingIndex !== null || feedback[index]) return;
    setPendingIndex(index);
    setError(null);
    try {
      const evaluation = await evaluateFibAnswer(
        settings,
        { sentenceContext: question.sentence, correctWord: question.correctWord, userAnswer },
        nextSignal(),
      );
      setFeedback((current) => ({ ...current, [index]: evaluation }));
    } catch (err) {
      setError(errorMessage(err, "Failed to check your answer."));
    } finally {
      setPendingIndex(null);
    }
  }

  const cards = result.questions.map((question, index) =>
    mode === "list" || index === activeIndex ? (
      <QuestionCard
        key={index}
        index={index}
        question={question}
        answer={answers[index] ?? ""}
        evaluation={feedback[index]}
        isChecking={pendingIndex === index}
        onChangeAnswer={(text) => setAnswers((current) => ({ ...current, [index]: text }))}
        onCheck={() => void check(index)}
      />
    ) : null,
  );

  return (
    <View style={styles.quiz}>
      <FormWidth>
        <View style={styles.toolbar}>
          <QuizModeBar mode={mode} onChange={setMode} />
          <ScorePill text={`${checkedCount}/${total} checked`} />
        </View>

        {mode === "step" && total > 0 && (
          <StepNavigator
            index={activeIndex}
            total={total}
            onPrevious={() => setActiveIndex((index) => Math.max(0, index - 1))}
            onNext={() => setActiveIndex((index) => Math.min(total - 1, index + 1))}
          />
        )}

        <ErrorText message={error} />

        {total === 0 && <EmptyNote message="No sentences were returned. Try generating again." />}
      </FormWidth>

      {mode === "list" ? <CardGrid>{cards}</CardGrid> : <FormWidth>{cards}</FormWidth>}
    </View>
  );
}

interface QuestionCardProps {
  index: number;
  question: FibQuestion;
  answer: string;
  evaluation: FibEvaluation | undefined;
  isChecking: boolean;
  onChangeAnswer: (text: string) => void;
  onCheck: () => void;
}

function QuestionCard({ index, question, answer, evaluation, isChecking, onChangeAnswer, onCheck }: QuestionCardProps) {
  const colors = useThemeColors();
  const locked = evaluation !== undefined || isChecking;

  return (
    <Panel>
      <QuestionHeading index={index} text={question.sentence} />
      <ListenButton text={question.sentence} label="Sentence" />
      {question.hint !== "" && <Text style={[styles.muted, { color: colors.mutedForeground }]}>Hint: {question.hint}</Text>}
      {question.contextClue !== "" && (
        <Text style={[styles.muted, styles.italic, { color: colors.mutedForeground }]}>{question.contextClue}</Text>
      )}

      <TextField
        label="Your answer"
        placeholder="Type your answer…"
        value={answer}
        onChangeText={onChangeAnswer}
        editable={!locked}
        maxLength={500}
        voice
      />
      <ActionButton
        label={isChecking ? "Checking…" : evaluation ? "Checked" : "Check answer"}
        icon={evaluation ? Check : undefined}
        loading={isChecking}
        disabled={evaluation !== undefined || answer.trim() === ""}
        variant="outline"
        onPress={onCheck}
      />

      {evaluation && (
        <FeedbackBox
          tone={evaluation.isCorrect ? "emerald" : "rose"}
          title={evaluation.status === "typo" ? "Almost! Small typo." : evaluation.isCorrect ? "Correct" : "Not quite."}
        >
          {evaluation.feedback !== "" && <Text style={[styles.body, { color: colors.foreground }]}>{evaluation.feedback}</Text>}
          {evaluation.improvementTip !== "" && (
            <Text style={[styles.muted, { color: colors.mutedForeground }]}>Tip: {evaluation.improvementTip}</Text>
          )}
          <ListenButton text={evaluation.feedback} label="Feedback" />
        </FeedbackBox>
      )}
    </Panel>
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
  muted: {
    fontSize: 13,
    lineHeight: 19,
  },
  italic: {
    fontStyle: "italic",
  },
  body: {
    fontSize: 14,
    lineHeight: 20,
  },
});

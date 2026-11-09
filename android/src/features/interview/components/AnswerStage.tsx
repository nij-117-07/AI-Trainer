// src/features/interview/components/AnswerStage.tsx
/** Step 3: the candidate's free-text answer to the current question, sent to the reviewer on submit. */
import { useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { Send } from "lucide-react-native";
import { radius, spacing, useThemeColors } from "@/theme";
import { ActionButton, TextField } from "@/components/tool/FormControls";
import { ListenButton } from "@/components/tool/ListenButton";
import { ANSWER_MAX_LENGTH } from "../options";
import type { InterviewQuestion } from "../types";
import { StagePanel } from "./StagePanel";

interface AnswerStageProps {
  question: InterviewQuestion;
  isPending: boolean;
  error: string | null;
  onSubmit: (answer: string) => void;
}

export function AnswerStage({ question, isPending, error, onSubmit }: AnswerStageProps) {
  const colors = useThemeColors();
  const [answer, setAnswer] = useState("");
  const trimmed = answer.trim();

  function submit() {
    if (isPending || !trimmed) return;
    onSubmit(trimmed);
  }

  return (
    <StagePanel
      step="Step 3"
      label="Your answer"
      hint="Take your time — the reviewer scores completeness, depth, clarity and technical accuracy."
      isPending={isPending}
      pendingLabel="Reviewing your answer…"
      error={error}
      actions={<ActionButton label="Submit answer" icon={Send} loading={isPending} onPress={submit} />}
    >
      <View style={[styles.question, { borderColor: colors.border, backgroundColor: colors.muted }]}>
        <Text style={[styles.questionText, { color: colors.foreground }]}>{question.question}</Text>
      </View>
      <ListenButton text={question.question} label="Question" />
      <TextField
        label="Your response"
        placeholder="Type your answer…"
        value={answer}
        onChangeText={setAnswer}
        editable={!isPending}
        maxLength={ANSWER_MAX_LENGTH}
        multiline
        voice
      />
    </StagePanel>
  );
}

const styles = StyleSheet.create({
  question: {
    borderWidth: 1,
    borderRadius: radius.lg,
    padding: spacing.md,
  },
  questionText: {
    fontSize: 15,
    fontWeight: "600",
    lineHeight: 22,
  },
});

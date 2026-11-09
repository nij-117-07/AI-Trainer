// src/features/testing-portal/components/TheoreticalQuestionCard.tsx
/**
 * One theoretical question with an answer box (text, voice, and/or image), "Grade my answer",
 * then "Try again" or "Next question". The model answer is offered only after grading, so the
 * learner attempts the question first. Mirrors the webui question card.
 */
import { useState } from "react";
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from "react-native";
import { ArrowRight, BookOpen, Mic, ShieldCheck, Square } from "lucide-react-native";
import { radius, spacing, useThemeColors } from "@/theme";
import { useAiSettings } from "@/features/ai-settings/providers/AiSettingsProvider";
import { useVoiceInput } from "@/features/chatbot/hooks/useVoiceInput";
import { appendTranscript, formatElapsed } from "@/features/chatbot/lib/voice-text";
import { useRequest } from "@/hooks/useRequest";
import { gradeAnswer, generateAnswer } from "../lib/generators";
import type { ImageInput, TheoreticalItem } from "../types";
import { ActionButton, ErrorText, Panel, TextField } from "@/components/tool/FormControls";
import { GraderFeedback } from "./GraderFeedback";
import { ImagePickerField } from "@/components/tool/ImagePickerField";

const MAX_ANSWER_CHARS = 5000;

interface TheoreticalQuestionCardProps {
  index: number;
  question: TheoreticalItem;
  contextSetting: string;
  difficultyLevel: string;
  onNext?: () => void;
}

export function TheoreticalQuestionCard({
  index,
  question,
  contextSetting,
  difficultyLevel,
  onNext,
}: TheoreticalQuestionCardProps) {
  const colors = useThemeColors();
  const { settings } = useAiSettings();
  const [answer, setAnswer] = useState("");
  const [image, setImage] = useState<ImageInput | null>(null);
  const grade = useRequest(gradeAnswer);
  const expert = useRequest(generateAnswer);
  const voice = useVoiceInput((text) => setAnswer((prev) => appendTranscript(prev, text)));
  const [gradedSnapshot, setGradedSnapshot] = useState<{ text: string; imageUri: string | null } | null>(null);
  const hasAnswer = answer.trim().length > 0 || image !== null;
  const answerChanged =
    gradedSnapshot !== null && (gradedSnapshot.text !== answer || gradedSnapshot.imageUri !== (image?.uri ?? null));

  function handleGrade() {
    setGradedSnapshot({ text: answer, imageUri: image?.uri ?? null });
    return grade.run(settings, {
      scenario: contextSetting,
      questionAsked: question.questionText,
      targetObjective: question.evaluationCriteria,
      expectedLevel: difficultyLevel,
      userAnswerText: answer,
      image,
    });
  }

  function handleExpertAnswer() {
    return expert.run(settings, {
      question: question.questionText,
      context: contextSetting,
      difficulty: difficultyLevel,
      responseFormat: "paragraph",
      customInstructions: "",
    });
  }

  function voiceStatus(): string {
    if (voice.recording) return `Recording ${formatElapsed(voice.elapsedMs)}. Tap the red button to finish.`;
    if (voice.transcribing) return "Transcribing your voice…";
    if (!voice.ready) return "Add the voice model in AI settings to answer by voice.";
    return "Answer by voice";
  }

  const voiceLocked = voice.transcribing || grade.pending;

  return (
    <Panel>
      <View style={styles.header}>
        <View style={[styles.badge, { backgroundColor: colors.tone.sky.bg }]}>
          <Text style={[styles.badgeNumber, { color: colors.primary }]}>{index + 1}</Text>
        </View>
        <View style={styles.headerBody}>
          <Text selectable style={[styles.questionText, { color: colors.foreground }]}>
            {question.questionText}
          </Text>
          <View style={[styles.tag, { backgroundColor: colors.tone.rose.bg, borderColor: colors.tone.rose.border }]}>
            <Text style={[styles.tagText, { color: colors.tone.rose.fg }]}>{question.focusArea}</Text>
          </View>
          <Text style={[styles.criteria, { color: colors.mutedForeground }]}>
            Great answers cover: {question.evaluationCriteria}
          </Text>
        </View>
      </View>

      <View style={[styles.section, { borderTopColor: colors.border }]}>
        <TextField
          label="Your answer"
          placeholder="Write your answer here, then grade it against the objective."
          hint={`${answer.length} / ${MAX_ANSWER_CHARS}`}
          value={answer}
          onChangeText={setAnswer}
          maxLength={MAX_ANSWER_CHARS}
          multiline
          editable={!grade.pending}
        />
        <View style={styles.voiceRow}>
          <Pressable
            onPress={() => void voice.toggle()}
            disabled={voiceLocked}
            accessibilityRole="button"
            accessibilityLabel={voice.recording ? "Stop recording" : "Start voice answer"}
            accessibilityState={{ busy: voice.transcribing, selected: voice.recording, disabled: voiceLocked }}
            style={({ pressed }) => [
              styles.micButton,
              { backgroundColor: voice.recording ? colors.destructive : colors.muted },
              pressed && styles.pressed,
              voiceLocked && styles.disabled,
            ]}
          >
            {voice.transcribing ? (
              <ActivityIndicator size="small" color={colors.foreground} />
            ) : voice.recording ? (
              <Square size={14} color={colors.background} fill={colors.background} />
            ) : (
              <Mic size={18} color={voice.ready ? colors.foreground : colors.mutedForeground} />
            )}
          </Pressable>
          <Text style={[styles.voiceStatus, { color: voice.recording ? colors.destructive : colors.mutedForeground }]}>
            {voiceStatus()}
          </Text>
        </View>
        <ErrorText message={voice.error} />
        <ImagePickerField value={image} onChange={setImage} disabled={grade.pending} />
        {grade.data && (
          <Text style={[styles.hint, { color: answerChanged ? colors.tone.amber.fg : colors.mutedForeground }]}>
            {answerChanged
              ? "Your answer has changed. Resubmit to update the feedback."
              : "Edit your answer above and resubmit to get new feedback."}
          </Text>
        )}
        <ActionButton
          label={grade.pending ? "Grading…" : grade.data ? "Resubmit for grading" : "Grade my answer"}
          icon={ShieldCheck}
          loading={grade.pending}
          disabled={!hasAnswer}
          onPress={handleGrade}
        />
        <ErrorText message={grade.error} />
        {grade.data && <GraderFeedback result={grade.data} />}
      </View>

      {grade.data && (
        <View style={[styles.section, { borderTopColor: colors.border }]}>
          {onNext && <ActionButton label="Next question" icon={ArrowRight} onPress={onNext} />}

          {!expert.data && (
            <ActionButton
              label={expert.pending ? "Generating model answer…" : "Show model answer"}
              icon={BookOpen}
              variant="outline"
              loading={expert.pending}
              onPress={handleExpertAnswer}
            />
          )}
          <ErrorText message={expert.error} />
          {expert.data && (
            <View style={[styles.expert, { backgroundColor: colors.background, borderColor: colors.border }]}>
              <Text selectable style={[styles.body, { color: colors.foreground }]}>
                {expert.data.answerText}
              </Text>
              {expert.data.keyConceptsCovered.length > 0 && (
                <View style={styles.chips}>
                  {expert.data.keyConceptsCovered.map((concept, conceptIndex) => (
                    <View
                      key={`${concept}-${conceptIndex}`}
                      style={[styles.chip, { backgroundColor: colors.tone.amber.bg, borderColor: colors.tone.amber.border }]}
                    >
                      <Text style={[styles.chipText, { color: colors.tone.amber.fg }]}>{concept}</Text>
                    </View>
                  ))}
                </View>
              )}
            </View>
          )}
        </View>
      )}
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
  badgeNumber: {
    fontSize: 13,
    fontWeight: "700",
  },
  headerBody: {
    flex: 1,
    gap: spacing.sm,
  },
  questionText: {
    fontSize: 16,
    lineHeight: 24,
    fontWeight: "500",
  },
  tag: {
    alignSelf: "flex-start",
    borderWidth: 1,
    borderRadius: radius.full,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
  },
  tagText: {
    fontSize: 12,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  criteria: {
    fontSize: 13,
    lineHeight: 19,
  },
  section: {
    borderTopWidth: 1,
    paddingTop: spacing.lg,
    gap: spacing.md,
  },
  voiceRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
  },
  micButton: {
    width: 44,
    height: 44,
    borderRadius: radius.full,
    alignItems: "center",
    justifyContent: "center",
  },
  voiceStatus: {
    flex: 1,
    fontSize: 13,
    lineHeight: 18,
  },
  hint: {
    fontSize: 13,
    lineHeight: 18,
  },
  pressed: {
    opacity: 0.85,
  },
  disabled: {
    opacity: 0.5,
  },
  expert: {
    borderWidth: 1,
    borderRadius: radius.lg,
    padding: spacing.lg,
    gap: spacing.md,
  },
  body: {
    fontSize: 14,
    lineHeight: 21,
  },
  chips: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
  },
  chip: {
    borderWidth: 1,
    borderRadius: radius.full,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
  },
  chipText: {
    fontSize: 13,
    fontWeight: "500",
  },
});

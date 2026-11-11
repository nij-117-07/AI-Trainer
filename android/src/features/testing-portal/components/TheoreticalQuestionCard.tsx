// src/features/testing-portal/components/TheoreticalQuestionCard.tsx
/**
 * One theoretical question with an answer box (text, voice, and/or image), grading, then resubmit
 * or "Next question". The hint and the model answer are offered only on request, so the learner
 * attempts the question first.
 */
import { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { ArrowRight, BookOpen, Lightbulb } from "lucide-react-native";
import { shape, spacing, touchTarget, typeScale, useThemeColors } from "@/theme";
import { useAiSettings } from "@/features/ai-settings/providers/AiSettingsProvider";
import { useRequest } from "@/hooks/useRequest";
import { gradeAnswer, generateAnswer } from "../lib/generators";
import type { TheoreticalAnswer } from "../lib/persistence";
import type { ImageInput, TheoreticalItem } from "../types";
import { ActionButton, ErrorText, Panel } from "@/components/tool/FormControls";
import { AnswerComposer } from "@/components/tool/AnswerComposer";
import { ImagePickerField } from "@/components/tool/ImagePickerField";
import { ListenButton } from "@/components/tool/ListenButton";
import { GraderFeedback } from "./GraderFeedback";

const MAX_ANSWER_CHARS = 5000;

interface TheoreticalQuestionCardProps {
  index: number;
  question: TheoreticalItem;
  contextSetting: string;
  difficultyLevel: string;
  saved: TheoreticalAnswer;
  saveFailed: boolean;
  onChange: (patch: Partial<TheoreticalAnswer>) => void;
  onNext?: () => void;
}

export function TheoreticalQuestionCard({
  index,
  question,
  contextSetting,
  difficultyLevel,
  saved,
  saveFailed,
  onChange,
  onNext,
}: TheoreticalQuestionCardProps) {
  const colors = useThemeColors();
  const { settings } = useAiSettings();
  const [image, setImage] = useState<ImageInput | null>(null);
  const [hintShown, setHintShown] = useState(false);
  const grade = useRequest(gradeAnswer);
  const expert = useRequest(generateAnswer);
  const [gradedImageUri, setGradedImageUri] = useState<string | null>(null);
  const answerChanged =
    saved.grade !== null && (saved.gradedText !== saved.answer || gradedImageUri !== (image?.uri ?? null));

  async function handleGrade() {
    const text = saved.answer;
    const imageUri = image?.uri ?? null;
    const result = await grade.run(settings, {
      scenario: contextSetting,
      questionAsked: question.questionText,
      targetObjective: question.evaluationCriteria,
      expectedLevel: difficultyLevel,
      userAnswerText: text,
      image,
    });
    if (!result) return;
    setGradedImageUri(imageUri);
    onChange({ grade: result, gradedText: text });
  }

  async function handleExpertAnswer() {
    const result = await expert.run(settings, {
      question: question.questionText,
      context: contextSetting,
      difficulty: difficultyLevel,
      responseFormat: "paragraph",
      customInstructions: "",
    });
    if (result) onChange({ expert: result });
  }

  return (
    <Panel>
      <View style={styles.header}>
        <View style={[styles.badge, { backgroundColor: colors.muted }]}>
          <Text style={[styles.badgeNumber, { color: colors.foreground }]}>{index + 1}</Text>
        </View>
        <View style={styles.headerBody}>
          <Text selectable accessibilityRole="header" style={[styles.questionText, { color: colors.foreground }]}>
            {question.questionText}
          </Text>
          {question.focusArea ? (
            <Text style={[styles.meta, { color: colors.mutedForeground }]}>{question.focusArea}</Text>
          ) : null}
          {question.evaluationCriteria ? (
            hintShown ? (
              <Text selectable style={[styles.meta, { color: colors.mutedForeground }]}>
                Great answers cover: {question.evaluationCriteria}
              </Text>
            ) : (
              <Pressable
                onPress={() => setHintShown(true)}
                accessibilityRole="button"
                accessibilityLabel="Show hint"
                style={({ pressed }) => [styles.hintButton, pressed && { opacity: 0.7 }]}
              >
                <Lightbulb size={16} color={colors.primary} />
                <Text style={[styles.hintText, { color: colors.primary }]}>Hint</Text>
              </Pressable>
            )
          ) : null}
        </View>
      </View>

      <View style={[styles.section, { borderTopColor: colors.border }]}>
        <AnswerComposer
          label="Your answer"
          placeholder="Write your answer"
          value={saved.answer}
          maxLength={MAX_ANSWER_CHARS}
          pending={grade.pending}
          error={grade.error}
          submitLabel={saved.grade ? "Resubmit answer" : "Grade answer"}
          allowEmpty={image !== null}
          onChangeText={(text) => onChange({ answer: text })}
          onSubmit={handleGrade}
        />
        <ImagePickerField value={image} onChange={setImage} disabled={grade.pending} label="Answer image (optional)" noun="answer image" hint="" />
        {answerChanged && (
          <Text accessibilityLiveRegion="polite" style={[styles.meta, { color: colors.foreground }]}>
            Answer changed. Resubmit to update the feedback.
          </Text>
        )}
        <ErrorText message={saveFailed ? "Changes couldn't be saved. They'll try again." : null} />
        {saved.grade && <GraderFeedback result={saved.grade} />}
      </View>

      {saved.grade && (
        <View style={[styles.section, { borderTopColor: colors.border }]}>
          {onNext && <ActionButton label="Next question" icon={ArrowRight} onPress={onNext} />}

          {!saved.expert && (
            <ActionButton
              label={expert.pending ? "Generating model answer…" : "Show model answer"}
              icon={BookOpen}
              variant="outline"
              loading={expert.pending}
              onPress={handleExpertAnswer}
            />
          )}
          <ErrorText message={expert.error} />
          {saved.expert && (
            <View style={[styles.expert, { backgroundColor: colors.background, borderColor: colors.border }]}>
              <Text selectable style={[styles.body, { color: colors.foreground }]}>
                {saved.expert.answerText}
              </Text>
              <ListenButton text={saved.expert.answerText} label="Model answer" />
              {saved.expert.keyConceptsCovered.length > 0 && (
                <View style={styles.chips}>
                  {saved.expert.keyConceptsCovered.map((concept, conceptIndex) => (
                    <View
                      key={`${concept}-${conceptIndex}`}
                      style={[styles.chip, { backgroundColor: colors.muted, borderColor: colors.border }]}
                    >
                      <Text style={[styles.chipText, { color: colors.foreground }]}>{concept}</Text>
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
    width: 28,
    height: 28,
    borderRadius: shape.full,
    alignItems: "center",
    justifyContent: "center",
  },
  badgeNumber: {
    ...typeScale.label,
    fontWeight: "700",
  },
  headerBody: {
    flex: 1,
    gap: spacing.sm,
  },
  questionText: {
    ...typeScale.title,
  },
  meta: {
    ...typeScale.label,
    fontWeight: "400",
  },
  hintButton: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    gap: spacing.xs,
    minHeight: touchTarget,
    paddingRight: spacing.sm,
  },
  hintText: {
    ...typeScale.label,
    fontWeight: "600",
  },
  section: {
    borderTopWidth: 1,
    paddingTop: spacing.lg,
    gap: spacing.md,
  },
  expert: {
    borderWidth: 1,
    borderRadius: shape.lg,
    padding: spacing.lg,
    gap: spacing.md,
  },
  body: {
    ...typeScale.body,
  },
  chips: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
  },
  chip: {
    borderWidth: 1,
    borderRadius: shape.full,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
  },
  chipText: {
    ...typeScale.label,
    fontWeight: "500",
  },
});

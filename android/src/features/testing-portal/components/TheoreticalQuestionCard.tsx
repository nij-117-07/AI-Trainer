// src/features/testing-portal/components/TheoreticalQuestionCard.tsx
/**
 * One theoretical question with an answer box (text and/or image), "Grade my answer", and
 * "Answer with AI" for an expert answer. Mirrors the webui question card.
 */
import { useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { BookOpen, ShieldCheck } from "lucide-react-native";
import { radius, spacing, useThemeColors } from "@/theme";
import { useAiSettings } from "@/features/ai-settings/providers/AiSettingsProvider";
import { useRequest } from "@/hooks/useRequest";
import { gradeAnswer, generateAnswer } from "../lib/generators";
import type { ImageInput, TheoreticalItem } from "../types";
import { ActionButton, ErrorText, Panel, TextField } from "@/components/tool/FormControls";
import { GraderFeedback } from "./GraderFeedback";
import { ImagePickerField } from "@/components/tool/ImagePickerField";

interface TheoreticalQuestionCardProps {
  index: number;
  question: TheoreticalItem;
  contextSetting: string;
  difficultyLevel: string;
}

export function TheoreticalQuestionCard({ index, question, contextSetting, difficultyLevel }: TheoreticalQuestionCardProps) {
  const colors = useThemeColors();
  const { settings } = useAiSettings();
  const [answer, setAnswer] = useState("");
  const [image, setImage] = useState<ImageInput | null>(null);
  const grade = useRequest(gradeAnswer);
  const expert = useRequest(generateAnswer);

  function handleGrade() {
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
          value={answer}
          onChangeText={setAnswer}
          maxLength={5000}
          multiline
          editable={!grade.pending}
        />
        <ImagePickerField value={image} onChange={setImage} disabled={grade.pending} />
        <ActionButton
          label={grade.pending ? "Grading…" : "Grade my answer"}
          icon={ShieldCheck}
          variant="outline"
          loading={grade.pending}
          onPress={handleGrade}
        />
        <ErrorText message={grade.error} />
        {grade.data && <GraderFeedback result={grade.data} />}
      </View>

      <View style={[styles.section, { borderTopColor: colors.border }]}>
        <ActionButton
          label={expert.pending ? "Generating expert answer…" : "Answer with AI"}
          icon={BookOpen}
          variant="outline"
          loading={expert.pending}
          onPress={handleExpertAnswer}
        />
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

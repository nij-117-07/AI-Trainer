// src/features/testing-portal/components/TheoreticalForm.tsx
/**
 * Theoretical question form, shown on its own page. The fields fill the body; the error and the
 * generate button sit in the footer. A successful generate returns to the Theoretical page.
 */
import { StyleSheet, Text, View } from "react-native";
import { Sparkles } from "lucide-react-native";
import { shape, spacing, typeScale, useThemeColors } from "@/theme";
import { ActionButton, ErrorText, TextField } from "@/components/tool/FormControls";
import { CountSlider } from "@/components/tool/CountSlider";
import { Disclosure } from "@/components/tool/Disclosure";
import { SelectField } from "@/components/tool/SelectField";
import { PAST_QUESTIONS_LIMIT } from "../lib/past-questions";
import {
  theoreticalDifficultyLevelOptions,
  theoreticalQuestionTypeOptions,
  THEORETICAL_MAX_QUESTIONS,
} from "../options";
import type { TheoreticalSetupState } from "../hooks/useTheoreticalSetup";

export function TheoreticalFormFields({ setup }: { setup: TheoreticalSetupState }) {
  const colors = useThemeColors();
  const { form, pending, update, existingCount, history } = setup;

  return (
    <>
      {existingCount > 0 && (
        <Text style={[styles.note, { color: colors.mutedForeground }]}>
          Adds to your {existingCount} saved questions.
        </Text>
      )}
      <TextField
        label="Topic"
        placeholder="e.g. Microservices"
        value={form.topic}
        onChangeText={(text) => update("topic", text)}
        editable={!pending}
        maxLength={200}
      />
      <TextField
        label="Context setting"
        placeholder="e.g. High-Tech Enterprise Interview"
        value={form.contextSetting}
        onChangeText={(text) => update("contextSetting", text)}
        editable={!pending}
        maxLength={200}
      />
      <SelectField
        label="Question type"
        options={theoreticalQuestionTypeOptions}
        value={form.questionType}
        onChange={(value) => update("questionType", value)}
        customPlaceholder="e.g. System design, Ethics"
      />
      <SelectField
        label="Difficulty"
        options={theoreticalDifficultyLevelOptions}
        value={form.difficultyLevel}
        onChange={(value) => update("difficultyLevel", value)}
        customPlaceholder="e.g. Principal engineer"
      />
      <CountSlider
        label="Number of questions"
        max={THEORETICAL_MAX_QUESTIONS}
        value={form.numQuestions}
        onChange={(value) => update("numQuestions", value)}
      />
      <TextField
        label="Source context (optional)"
        placeholder="e.g. Paste an article or notes the questions should be based on"
        value={form.sourceContext}
        onChangeText={(text) => update("sourceContext", text)}
        editable={!pending}
        maxLength={5000}
        multiline
      />
      <TextField
        label="User instructions (optional)"
        placeholder="e.g. Focus on trade-offs, avoid buzzwords"
        value={form.customInstructions}
        onChangeText={(text) => update("customInstructions", text)}
        editable={!pending}
        maxLength={1000}
        multiline
        voice
      />
      {history.length > 0 && (
        <Disclosure
          title="Past questions"
          summary={`${history.length} of ${PAST_QUESTIONS_LIMIT} kept to avoid repeats.`}
        >
          <View style={styles.list}>
            {history.map((question, index) => (
              <Text key={`${index}-${question}`} style={[styles.item, { color: colors.foreground, borderColor: colors.border }]}>
                {index + 1}. {question}
              </Text>
            ))}
          </View>
        </Disclosure>
      )}
    </>
  );
}

export function TheoreticalFormFooter({ setup }: { setup: TheoreticalSetupState }) {
  const { pending, error, submit } = setup;

  return (
    <View style={styles.footer}>
      <ErrorText message={error} />
      <ActionButton
        label={pending ? "Writing questions…" : "Generate questions"}
        icon={Sparkles}
        loading={pending}
        onPress={() => void submit()}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  note: {
    ...typeScale.label,
  },
  footer: {
    gap: spacing.md,
  },
  list: {
    gap: spacing.sm,
  },
  item: {
    borderWidth: 1,
    borderRadius: shape.lg,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    ...typeScale.label,
    fontWeight: "400",
  },
});

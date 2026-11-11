// src/features/testing-portal/components/McqForm.tsx
/**
 * MCQ setup form, shown on its own page. The fields fill the body; the error and the generate
 * button sit in the footer. A successful generate returns to the MCQ page.
 */
import { StyleSheet, Text, View } from "react-native";
import { Sparkles } from "lucide-react-native";
import { spacing, typeScale, useThemeColors } from "@/theme";
import { ActionButton, ErrorText, TextField } from "@/components/tool/FormControls";
import { CountSlider } from "@/components/tool/CountSlider";
import { Disclosure } from "@/components/tool/Disclosure";
import { SelectField } from "@/components/tool/SelectField";
import { PAST_QUESTIONS_LIMIT } from "../lib/past-questions";
import { mcqDifficultyLevelOptions, mcqQuestionTypeOptions, MCQ_MAX_QUESTIONS } from "../options";
import type { McqSetupState } from "../hooks/useMcqSetup";

export function McqFormFields({ setup }: { setup: McqSetupState }) {
  const colors = useThemeColors();
  const { form, pending, update, existingCount, history } = setup;

  return (
    <>
      {existingCount > 0 && (
        <Text style={[styles.note, { color: colors.mutedForeground }]}>
          Adds to your {existingCount} saved questions. Start over from the MCQs page.
        </Text>
      )}
      <TextField
        label="Topic"
        placeholder="e.g. Python concurrency"
        value={form.topic}
        onChangeText={(text) => update("topic", text)}
        editable={!pending}
        maxLength={200}
      />
      <TextField
        label="Context setting"
        placeholder="e.g. Senior Backend Engineer Interview"
        value={form.contextSetting}
        onChangeText={(text) => update("contextSetting", text)}
        editable={!pending}
        maxLength={200}
      />
      <SelectField
        label="Question type"
        options={mcqQuestionTypeOptions}
        value={form.questionType}
        onChange={(value) => update("questionType", value)}
        customPlaceholder="e.g. Debugging, Trade-offs"
      />
      <SelectField
        label="Difficulty"
        options={mcqDifficultyLevelOptions}
        value={form.difficultyLevel}
        onChange={(value) => update("difficultyLevel", value)}
        customPlaceholder="e.g. Interview-ready, Graduate level"
      />
      <CountSlider
        label="Number of questions"
        max={MCQ_MAX_QUESTIONS}
        value={form.numQuestions}
        onChange={(value) => update("numQuestions", value)}
      />
      <TextField
        label="Instructions (optional)"
        placeholder="e.g. Use short code snippets, avoid trick questions"
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
              <Text key={`${index}-${question}`} style={[styles.item, { color: colors.foreground }]}>
                {index + 1}. {question}
              </Text>
            ))}
          </View>
        </Disclosure>
      )}
    </>
  );
}

export function McqFormFooter({ setup }: { setup: McqSetupState }) {
  const { pending, error, submit } = setup;

  return (
    <View style={styles.footer}>
      <ErrorText message={error} />
      <ActionButton
        label={pending ? "Generating questions…" : "Generate questions"}
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
    fontWeight: "400",
  },
  footer: {
    gap: spacing.md,
  },
  list: {
    gap: spacing.sm,
  },
  item: {
    ...typeScale.label,
    fontWeight: "400",
  },
});

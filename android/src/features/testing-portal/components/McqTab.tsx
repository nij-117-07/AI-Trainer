// src/features/testing-portal/components/McqTab.tsx
import { useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import Slider from "@react-native-community/slider";
import { Sparkles } from "lucide-react-native";
import { spacing, useThemeColors } from "@/theme";
import { useAiSettings } from "@/features/ai-settings/providers/AiSettingsProvider";
import { useRequest } from "../hooks/useRequest";
import { generateMcqs } from "../lib/generators";
import { PAST_QUESTIONS_LIMIT } from "../lib/past-questions";
import { mcqDifficultyLevelOptions, mcqQuestionTypeOptions } from "../options";
import type { McqFormValues } from "../types";
import { ActionButton, ErrorText, Field, Panel, TextField } from "./FormControls";
import { McqQuiz } from "./McqQuiz";
import { SelectField } from "./SelectField";
import { Section } from "./Section";

const MAX_QUESTIONS = 10;

const DEFAULTS: McqFormValues = {
  topic: "",
  questionType: "academic",
  numQuestions: 3,
  difficultyLevel: "intermediate",
  contextSetting: "",
  customInstructions: "",
  pastQuestions: "",
};

export function McqTab() {
  const colors = useThemeColors();
  const { settings } = useAiSettings();
  const [form, setForm] = useState<McqFormValues>(DEFAULTS);
  const [history, setHistory] = useState<string[]>([]);
  const [quizKey, setQuizKey] = useState(0);
  const generate = useRequest(generateMcqs);

  function update<K extends keyof McqFormValues>(key: K, value: McqFormValues[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleGenerate() {
    const result = await generate.run(settings, { ...form, pastQuestions: history.join("\n") });
    if (!result) return;
    setHistory((prev) => [...prev, ...result.map((question) => question.questionText)].slice(-PAST_QUESTIONS_LIMIT));
    setQuizKey((key) => key + 1);
  }

  return (
    <Section>
      <Panel>
        <TextField
          label="Topic"
          placeholder="e.g. Python concurrency"
          value={form.topic}
          onChangeText={(text) => update("topic", text)}
          maxLength={200}
        />
        <TextField
          label="Context setting"
          placeholder="e.g. Senior Backend Engineer Interview"
          value={form.contextSetting}
          onChangeText={(text) => update("contextSetting", text)}
          maxLength={200}
        />
        <SelectField
          label="Question type"
          options={mcqQuestionTypeOptions}
          value={form.questionType}
          onChange={(value) => update("questionType", value)}
          customPlaceholder="Type your own question type"
        />
        <SelectField
          label="Difficulty"
          options={mcqDifficultyLevelOptions}
          value={form.difficultyLevel}
          onChange={(value) => update("difficultyLevel", value)}
          customPlaceholder="Type your own difficulty"
        />
        <Field label="Number of questions">
          <View style={styles.sliderRow}>
            <Slider
              style={styles.slider}
              minimumValue={1}
              maximumValue={MAX_QUESTIONS}
              step={1}
              value={form.numQuestions}
              onValueChange={(value) => update("numQuestions", Math.round(value))}
              minimumTrackTintColor={colors.primary}
              maximumTrackTintColor={colors.border}
              thumbTintColor={colors.primary}
            />
            <Text style={[styles.sliderValue, { color: colors.foreground }]}>{form.numQuestions}</Text>
          </View>
        </Field>
        <TextField
          label="Custom instructions"
          placeholder="Optional"
          value={form.customInstructions}
          onChangeText={(text) => update("customInstructions", text)}
          maxLength={1000}
          multiline
        />
        <ActionButton label="Generate MCQs" icon={Sparkles} loading={generate.pending} onPress={handleGenerate} />
        <ErrorText message={generate.error} />
      </Panel>

      <Panel>
        <Field
          label={`Past questions (${history.length} of ${PAST_QUESTIONS_LIMIT})`}
          hint="Questions you generate are sent with the next request so the model avoids repeats."
        >
          {history.length === 0 ? (
            <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>No questions generated yet.</Text>
          ) : (
            <View style={styles.history}>
              {history.map((question, index) => (
                <Text
                  key={`${index}-${question}`}
                  numberOfLines={2}
                  style={[styles.historyItem, { color: colors.foreground, borderColor: colors.border }]}
                >
                  {index + 1}. {question}
                </Text>
              ))}
            </View>
          )}
        </Field>
        {history.length > 0 && (
          <ActionButton label="Clear past questions" variant="outline" onPress={() => setHistory([])} />
        )}
      </Panel>

      {generate.data && <McqQuiz key={quizKey} questions={generate.data} contextSetting={form.contextSetting} />}
    </Section>
  );
}

const styles = StyleSheet.create({
  sliderRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
  },
  slider: {
    flex: 1,
    height: 40,
  },
  sliderValue: {
    minWidth: 28,
    textAlign: "center",
    fontSize: 18,
    fontWeight: "700",
  },
  emptyText: {
    fontSize: 14,
  },
  history: {
    gap: spacing.sm,
  },
  historyItem: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    fontSize: 14,
    lineHeight: 20,
  },
});

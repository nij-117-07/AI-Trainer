// src/features/testing-portal/components/McqTab.tsx
import { useState } from "react";
import { Sparkles } from "lucide-react-native";
import { useAiSettings } from "@/features/ai-settings/providers/AiSettingsProvider";
import { useRequest } from "../hooks/useRequest";
import { generateMcqs } from "../lib/generators";
import { countOptions, mcqDifficultyLevelOptions, mcqQuestionTypeOptions } from "../options";
import type { McqFormValues } from "../types";
import { ActionButton, ChoiceChips, ErrorText, Field, Panel, TextField } from "./FormControls";
import { McqQuiz } from "./McqQuiz";
import { Section } from "./Section";

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
  const { settings } = useAiSettings();
  const [form, setForm] = useState<McqFormValues>(DEFAULTS);
  const [quizKey, setQuizKey] = useState(0);
  const generate = useRequest(generateMcqs);

  function update<K extends keyof McqFormValues>(key: K, value: McqFormValues[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleGenerate() {
    const result = await generate.run(settings, form);
    if (result) setQuizKey((key) => key + 1);
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
        <Field label="Question type">
          <ChoiceChips options={mcqQuestionTypeOptions} value={form.questionType} onChange={(v) => update("questionType", v)} />
        </Field>
        <Field label="Difficulty">
          <ChoiceChips options={mcqDifficultyLevelOptions} value={form.difficultyLevel} onChange={(v) => update("difficultyLevel", v)} />
        </Field>
        <Field label="Number of questions">
          <ChoiceChips options={countOptions(10)} value={form.numQuestions} onChange={(v) => update("numQuestions", v)} />
        </Field>
        <TextField
          label="Custom instructions"
          placeholder="Optional"
          value={form.customInstructions}
          onChangeText={(text) => update("customInstructions", text)}
          maxLength={1000}
          multiline
        />
        <TextField
          label="Past questions"
          hint="One per line. Used to avoid repeats; only the most recent few are sent."
          value={form.pastQuestions}
          onChangeText={(text) => update("pastQuestions", text)}
          maxLength={5000}
          multiline
        />
        <ActionButton label="Generate MCQs" icon={Sparkles} loading={generate.pending} onPress={handleGenerate} />
        <ErrorText message={generate.error} />
      </Panel>

      {generate.data && <McqQuiz key={quizKey} questions={generate.data} contextSetting={form.contextSetting} />}
    </Section>
  );
}

// src/features/language-tester/components/AssessmentTab.tsx
/** Language Tester assessment: the setup form and the multiple-choice quiz it generates. */
import { useState } from "react";
import { RefreshCcw, Sparkles } from "lucide-react-native";
import { useAiSettings } from "@/features/ai-settings/providers/AiSettingsProvider";
import { ActionButton, ErrorText, Panel, TextField } from "@/components/tool/FormControls";
import { CountSlider } from "@/components/tool/CountSlider";
import { SelectField } from "@/components/tool/SelectField";
import { Section } from "@/components/tool/Section";
import { useRequest } from "@/hooks/useRequest";
import { generateAssessment } from "../lib/generators";
import { LANGUAGE_TESTER_STORAGE_KEYS } from "../lib/persistence";
import { CEFR_LEVEL_OPTIONS } from "../options";
import { useRunSignal } from "../hooks/useRunSignal";
import { usePersistedTool } from "../hooks/usePersistedValue";
import type { AssessmentFormValues, AssessmentResult } from "../types";
import { AssessmentQuiz } from "./AssessmentQuiz";
import { EmptyNote } from "./QuizParts";

const DEFAULTS: AssessmentFormValues = {
  targetLanguage: "Spanish",
  nativeLanguage: "English",
  level: "B1",
  numQuestions: 5,
  scenario: "Booking a hotel room",
  userDetails: "A business traveler",
  seed: "",
  customInstructions: "",
};

export function AssessmentTab() {
  const { settings } = useAiSettings();
  const { form, setForm, result, setResult, reset } = usePersistedTool<AssessmentFormValues, AssessmentResult>(
    LANGUAGE_TESTER_STORAGE_KEYS.assessment,
    DEFAULTS,
  );
  const request = useRequest(generateAssessment);
  const nextSignal = useRunSignal();
  const [runKey, setRunKey] = useState(0);

  function update<K extends keyof AssessmentFormValues>(key: K, value: AssessmentFormValues[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function handleReset() {
    reset();
    request.reset();
  }

  async function handleGenerate() {
    const next = await request.run(settings, form, nextSignal());
    if (next) {
      setResult(next);
      setRunKey((key) => key + 1);
    }
  }

  return (
    <Section>
      <Panel>
        <TextField
          label="Target language"
          placeholder="e.g. Spanish"
          value={form.targetLanguage}
          onChangeText={(text) => update("targetLanguage", text)}
          editable={!request.pending}
          maxLength={100}
        />
        <TextField
          label="Native language"
          placeholder="e.g. English"
          value={form.nativeLanguage}
          onChangeText={(text) => update("nativeLanguage", text)}
          editable={!request.pending}
          maxLength={100}
        />
        <SelectField
          label="Level"
          options={CEFR_LEVEL_OPTIONS}
          value={form.level}
          onChange={(value) => update("level", value)}
          allowCustom={false}
        />
        <CountSlider
          label="Number of questions"
          max={10}
          value={form.numQuestions}
          onChange={(value) => update("numQuestions", value)}
        />
        <TextField
          label="Scenario"
          placeholder="e.g. Booking a hotel room"
          value={form.scenario}
          onChangeText={(text) => update("scenario", text)}
          editable={!request.pending}
          maxLength={500}
        />
        <TextField
          label="User details"
          placeholder="e.g. A business traveler"
          hint="Persona info used to personalize the questions."
          value={form.userDetails}
          onChangeText={(text) => update("userDetails", text)}
          editable={!request.pending}
          maxLength={500}
        />
        <TextField
          label="Custom instructions (optional)"
          placeholder="e.g. only use past tense"
          hint="Specific focus for the questions."
          value={form.customInstructions}
          onChangeText={(text) => update("customInstructions", text)}
          editable={!request.pending}
          maxLength={1000}
          multiline
        />
        <TextField
          label="Seed (variety)"
          placeholder="Leave blank to auto-generate"
          hint="Change this to get a different test for the same inputs."
          value={form.seed}
          onChangeText={(text) => update("seed", text)}
          editable={!request.pending}
          maxLength={200}
        />
        <ActionButton
          label={request.pending ? "Writing your questions…" : "Generate assessment"}
          icon={Sparkles}
          loading={request.pending}
          onPress={handleGenerate}
        />
      </Panel>

      <ErrorText message={request.error} />

      {result ? (
        <AssessmentQuiz key={runKey} result={result} />
      ) : (
        <EmptyNote message="Pick a language and level to generate a personalized quiz." />
      )}

      <ActionButton label="Reset" icon={RefreshCcw} variant="outline" onPress={handleReset} />
    </Section>
  );
}

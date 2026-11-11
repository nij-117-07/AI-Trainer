// src/features/language-tester/components/AssessmentTab.tsx
/** Language Tester assessment: the setup form and the multiple-choice quiz it generates. */
import { useState } from "react";
import { StyleSheet, View } from "react-native";
import { ListChecks, Sparkles } from "lucide-react-native";
import { spacing } from "@/theme";
import { useAiSettings } from "@/features/ai-settings/providers/AiSettingsProvider";
import { ActiveLanguageNotice } from "@/features/language-profiles/components/ActiveLanguageNotice";
import { useLanguageProfiles } from "@/features/language-profiles/providers/LanguageProfilesProvider";
import { languagePair } from "@/features/language-profiles/lib/profiles";
import { ActionButton, ChoiceChips, ErrorText, Field, Panel, TextField } from "@/components/tool/FormControls";
import { Disclosure } from "@/components/tool/Disclosure";
import { EmptyHint } from "@/components/tool/EmptyHint";
import { ResetButton } from "@/components/tool/ResetButton";
import { Section } from "@/components/tool/Section";
import { useRequest } from "@/hooks/useRequest";
import { generateAssessment } from "../lib/generators";
import { LANGUAGE_TESTER_STORAGE_KEYS, SAVE_FAILED_MESSAGE } from "../lib/persistence";
import { CEFR_LEVEL_OPTIONS } from "../options";
import { useRunSignal } from "../hooks/useRunSignal";
import { usePersistedTool } from "../hooks/usePersistedValue";
import type { AssessmentFormValues, AssessmentResult } from "../types";
import { AssessmentQuiz } from "./AssessmentQuiz";
import { FormWidth } from "./QuizParts";

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

const LEVEL_CHIPS = CEFR_LEVEL_OPTIONS.map((option) => ({ value: option.value, label: option.value }));
const COUNT_CHIPS = Array.from({ length: 10 }, (_, index) => ({ value: index + 1, label: String(index + 1) }));

export function AssessmentTab() {
  const { settings } = useAiSettings();
  const { activeProfile } = useLanguageProfiles();
  const { form, setForm, result, setResult, reset, saveError } = usePersistedTool<AssessmentFormValues, AssessmentResult>(
    LANGUAGE_TESTER_STORAGE_KEYS.assessment,
    DEFAULTS,
  );
  const request = useRequest(generateAssessment);
  const nextSignal = useRunSignal();
  const [runKey, setRunKey] = useState(0);
  const [setupOpen, setSetupOpen] = useState(false);

  function update<K extends keyof AssessmentFormValues>(key: K, value: AssessmentFormValues[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function handleReset() {
    reset();
    request.reset();
  }

  async function handleGenerate() {
    const next = await request.run(settings, { ...form, ...languagePair(activeProfile) }, nextSignal());
    if (next) {
      setResult(next);
      setRunKey((key) => key + 1);
      setSetupOpen(false);
    }
  }

  const fields = (
    <>
      <ActiveLanguageNotice />
      <Field label="Level">
        <ChoiceChips
          options={LEVEL_CHIPS}
          value={form.level}
          onChange={(value) => update("level", value)}
          disabled={request.pending}
        />
      </Field>
      <Field label="Number of questions">
        <ChoiceChips
          options={COUNT_CHIPS}
          value={form.numQuestions}
          onChange={(value) => update("numQuestions", value)}
          disabled={request.pending}
        />
      </Field>
      <TextField
        label="Topic"
        placeholder="e.g. Booking a hotel room"
        value={form.scenario}
        onChangeText={(text) => update("scenario", text)}
        editable={!request.pending}
        maxLength={500}
        voice
      />
      <TextField
        label="User details"
        placeholder="e.g. A business traveler"
        value={form.userDetails}
        onChangeText={(text) => update("userDetails", text)}
        editable={!request.pending}
        maxLength={500}
        voice
      />
      <TextField
        label="Custom instructions (optional)"
        placeholder="e.g. only use past tense"
        value={form.customInstructions}
        onChangeText={(text) => update("customInstructions", text)}
        editable={!request.pending}
        maxLength={1000}
        multiline
        voice
      />
      <TextField
        label="Seed (optional)"
        placeholder="Leave blank for a new test"
        value={form.seed}
        onChangeText={(text) => update("seed", text)}
        editable={!request.pending}
        maxLength={200}
      />
      <View style={styles.actions}>
        <View style={styles.primary}>
          <ActionButton
            label={request.pending ? "Writing your questions…" : "Start assessment"}
            icon={Sparkles}
            loading={request.pending}
            onPress={handleGenerate}
          />
        </View>
        <ResetButton accessibilityLabel="Reset form and results" onPress={handleReset} />
      </View>
    </>
  );

  return (
    <Section>
      <FormWidth>
        {result ? (
          <Disclosure
            title="Setup"
            summary={`${form.level} · ${form.numQuestions} ${form.numQuestions === 1 ? "question" : "questions"} · ${form.scenario}`}
            open={setupOpen}
            onToggle={setSetupOpen}
          >
            {fields}
          </Disclosure>
        ) : (
          <Panel>{fields}</Panel>
        )}
        <ErrorText message={request.error} />
        <ErrorText message={saveError ? SAVE_FAILED_MESSAGE : null} />
      </FormWidth>

      {result ? (
        <AssessmentQuiz key={runKey} result={result} />
      ) : (
        <FormWidth>
          <EmptyHint icon={ListChecks} title="No assessment yet" hint="Choose a level and topic, then start." />
        </FormWidth>
      )}
    </Section>
  );
}

const styles = StyleSheet.create({
  actions: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  primary: {
    flex: 1,
  },
});

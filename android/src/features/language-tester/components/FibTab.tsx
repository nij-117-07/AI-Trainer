// src/features/language-tester/components/FibTab.tsx
/** Language Tester fill-in-the-blank: the setup form and the sentences it generates. */
import { useState } from "react";
import { RefreshCcw, Sparkles } from "lucide-react-native";
import { useAiSettings } from "@/features/ai-settings/providers/AiSettingsProvider";
import { ActiveLanguageNotice } from "@/features/language-profiles/components/ActiveLanguageNotice";
import { useLanguageProfiles } from "@/features/language-profiles/providers/LanguageProfilesProvider";
import { languagePair } from "@/features/language-profiles/lib/profiles";
import { ActionButton, ErrorText, Panel, TextField } from "@/components/tool/FormControls";
import { CountSlider } from "@/components/tool/CountSlider";
import { SelectField } from "@/components/tool/SelectField";
import { Section } from "@/components/tool/Section";
import { useRequest } from "@/hooks/useRequest";
import { generateFibQuestions } from "../lib/generators";
import { LANGUAGE_TESTER_STORAGE_KEYS } from "../lib/persistence";
import { CEFR_LEVEL_OPTIONS } from "../options";
import { useRunSignal } from "../hooks/useRunSignal";
import { usePersistedTool } from "../hooks/usePersistedValue";
import type { FibFormValues, FibResult } from "../types";
import { FibQuiz } from "./FibQuiz";
import { EmptyNote, FormWidth } from "./QuizParts";

const DEFAULTS: FibFormValues = {
  targetLanguage: "German",
  level: "A2",
  numQuestions: 3,
  scenario: "At the pharmacy",
  userDetails: "A nurse",
  seed: "",
};

export function FibTab() {
  const { settings } = useAiSettings();
  const { activeProfile } = useLanguageProfiles();
  const { form, setForm, result, setResult, reset } = usePersistedTool<FibFormValues, FibResult>(
    LANGUAGE_TESTER_STORAGE_KEYS.fib,
    DEFAULTS,
  );
  const request = useRequest(generateFibQuestions);
  const nextSignal = useRunSignal();
  const [runKey, setRunKey] = useState(0);

  function update<K extends keyof FibFormValues>(key: K, value: FibFormValues[K]) {
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
    }
  }

  return (
    <Section>
      <FormWidth>
        <Panel>
          <ActiveLanguageNotice />
          <SelectField
            label="Level"
            options={CEFR_LEVEL_OPTIONS}
            value={form.level}
            onChange={(value) => update("level", value)}
            allowCustom={false}
          />
          <CountSlider
            label="Number of sentences"
            max={10}
            value={form.numQuestions}
            onChange={(value) => update("numQuestions", value)}
          />
          <TextField
            label="Scenario"
            placeholder="e.g. At the pharmacy"
            value={form.scenario}
            onChangeText={(text) => update("scenario", text)}
            editable={!request.pending}
            maxLength={500}
            voice
          />
          <TextField
            label="User details"
            placeholder="e.g. A nurse"
            hint="Your background, used to make sentences relatable."
            value={form.userDetails}
            onChangeText={(text) => update("userDetails", text)}
            editable={!request.pending}
            maxLength={500}
            voice
          />
          <TextField
            label="Seed (variety)"
            placeholder="Leave blank to auto-generate"
            hint="Change this to get different sentences for the same inputs."
            value={form.seed}
            onChangeText={(text) => update("seed", text)}
            editable={!request.pending}
            maxLength={200}
          />
          <ActionButton
            label={request.pending ? "Writing sentences…" : "Generate sentences"}
            icon={Sparkles}
            loading={request.pending}
            onPress={handleGenerate}
          />
        </Panel>
        <ErrorText message={request.error} />
      </FormWidth>

      {result ? (
        <FibQuiz key={runKey} result={result} />
      ) : (
        <FormWidth>
          <EmptyNote message="Pick a language and scenario to generate fill-in-the-blank practice." />
        </FormWidth>
      )}

      <FormWidth>
        <ActionButton label="Reset form and results" icon={RefreshCcw} variant="outline" onPress={handleReset} />
      </FormWidth>
    </Section>
  );
}

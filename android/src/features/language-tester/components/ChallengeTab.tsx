// src/features/language-tester/components/ChallengeTab.tsx
/** Language Tester translation challenge: the setup form and the challenge it generates. */
import { useState } from "react";
import { RefreshCcw, Sparkles } from "lucide-react-native";
import { useAiSettings } from "@/features/ai-settings/providers/AiSettingsProvider";
import { ActionButton, ErrorText, Panel, TextField } from "@/components/tool/FormControls";
import { SelectField } from "@/components/tool/SelectField";
import { Section } from "@/components/tool/Section";
import { useRequest } from "@/hooks/useRequest";
import { generateChallenge } from "../lib/generators";
import { LANGUAGE_TESTER_STORAGE_KEYS } from "../lib/persistence";
import { CEFR_LEVEL_OPTIONS } from "../options";
import { useRunSignal } from "../hooks/useRunSignal";
import { usePersistedTool } from "../hooks/usePersistedValue";
import type { ChallengeFormValues, ChallengeResult as ChallengeResultData } from "../types";
import { ChallengeResult } from "./ChallengeResult";
import { EmptyNote } from "./QuizParts";

const DEFAULTS: ChallengeFormValues = {
  targetLanguage: "Japanese",
  nativeLanguage: "English",
  level: "B1",
  scenario: "Discussing skyscraper blueprints",
  userPersona: "An International Architect",
  seed: "",
  customInstructions: "",
};

export function ChallengeTab() {
  const { settings } = useAiSettings();
  const { form, setForm, result, setResult, reset } = usePersistedTool<ChallengeFormValues, ChallengeResultData>(
    LANGUAGE_TESTER_STORAGE_KEYS.challenge,
    DEFAULTS,
  );
  const request = useRequest(generateChallenge);
  const nextSignal = useRunSignal();
  const [runKey, setRunKey] = useState(0);

  function update<K extends keyof ChallengeFormValues>(key: K, value: ChallengeFormValues[K]) {
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
          placeholder="e.g. Japanese"
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
        <TextField
          label="Scenario"
          placeholder="e.g. Discussing skyscraper blueprints"
          value={form.scenario}
          onChangeText={(text) => update("scenario", text)}
          editable={!request.pending}
          maxLength={500}
        />
        <TextField
          label="User persona"
          placeholder="e.g. An International Architect"
          hint="Who you are in this challenge."
          value={form.userPersona}
          onChangeText={(text) => update("userPersona", text)}
          editable={!request.pending}
          maxLength={500}
        />
        <TextField
          label="Custom instructions (optional)"
          placeholder="e.g. use informal pronouns"
          hint="Specific focus for the challenge."
          value={form.customInstructions}
          onChangeText={(text) => update("customInstructions", text)}
          editable={!request.pending}
          maxLength={1000}
          multiline
        />
        <TextField
          label="Seed (variety)"
          placeholder="Leave blank to auto-generate"
          hint="Determines the challenge type and scenario consistency."
          value={form.seed}
          onChangeText={(text) => update("seed", text)}
          editable={!request.pending}
          maxLength={200}
        />
        <ActionButton
          label={request.pending ? "Crafting your challenge…" : "Generate challenge"}
          icon={Sparkles}
          loading={request.pending}
          onPress={handleGenerate}
        />
      </Panel>

      <ErrorText message={request.error} />

      {result ? (
        <ChallengeResult key={runKey} result={result} />
      ) : (
        <EmptyNote message="Pick a language, level, and scenario to generate a translation challenge." />
      )}

      <ActionButton label="Reset" icon={RefreshCcw} variant="outline" onPress={handleReset} />
    </Section>
  );
}

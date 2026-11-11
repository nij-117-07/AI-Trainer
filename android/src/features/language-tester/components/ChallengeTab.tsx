// src/features/language-tester/components/ChallengeTab.tsx
/** Language Tester translation challenge: the setup form and the challenge it generates. */
import { useState } from "react";
import { StyleSheet, View } from "react-native";
import { Sparkles } from "lucide-react-native";
import { useAiSettings } from "@/features/ai-settings/providers/AiSettingsProvider";
import { ActiveLanguageNotice } from "@/features/language-profiles/components/ActiveLanguageNotice";
import { useLanguageProfiles } from "@/features/language-profiles/providers/LanguageProfilesProvider";
import { languagePair } from "@/features/language-profiles/lib/profiles";
import { ActionButton, ChoiceChips, ErrorText, Field, Panel, TextField } from "@/components/tool/FormControls";
import { Disclosure } from "@/components/tool/Disclosure";
import { ResetButton } from "@/components/tool/ResetButton";
import { Section } from "@/components/tool/Section";
import { useRequest } from "@/hooks/useRequest";
import { generateChallenge } from "../lib/generators";
import { LANGUAGE_TESTER_STORAGE_KEYS, SAVE_FAILED_MESSAGE } from "../lib/persistence";
import { CEFR_LEVEL_OPTIONS } from "../options";
import { useRunSignal } from "../hooks/useRunSignal";
import { usePersistedTool } from "../hooks/usePersistedValue";
import type { ChallengeFormValues, ChallengeResult as ChallengeResultData } from "../types";
import { ChallengeResult } from "./ChallengeResult";

const DEFAULTS: ChallengeFormValues = {
  targetLanguage: "Japanese",
  nativeLanguage: "English",
  level: "B1",
  scenario: "Discussing skyscraper blueprints",
  userPersona: "An International Architect",
  seed: "",
  customInstructions: "",
};

const LEVEL_CHIPS = CEFR_LEVEL_OPTIONS.map(({ value }) => ({ value, label: value }));

export function ChallengeTab() {
  const { settings } = useAiSettings();
  const { activeProfile } = useLanguageProfiles();
  const { form, setForm, result, setResult, reset, saveError } = usePersistedTool<ChallengeFormValues, ChallengeResultData>(
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
    const next = await request.run(settings, { ...form, ...languagePair(activeProfile) }, nextSignal());
    if (next) {
      setResult(next);
      setRunKey((key) => key + 1);
    }
  }

  const setupFields = (
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
      <TextField
        label="Scenario"
        placeholder="e.g. Discussing skyscraper blueprints"
        value={form.scenario}
        onChangeText={(text) => update("scenario", text)}
        editable={!request.pending}
        maxLength={500}
        voice
      />
      <TextField
        label="User persona"
        placeholder="e.g. An International Architect"
        value={form.userPersona}
        onChangeText={(text) => update("userPersona", text)}
        editable={!request.pending}
        maxLength={500}
        voice
      />
      <TextField
        label="Custom instructions (optional)"
        placeholder="e.g. use informal pronouns"
        value={form.customInstructions}
        onChangeText={(text) => update("customInstructions", text)}
        editable={!request.pending}
        maxLength={1000}
        multiline
        voice
      />
      <TextField
        label="Seed (optional)"
        placeholder="Leave blank to auto-generate"
        value={form.seed}
        onChangeText={(text) => update("seed", text)}
        editable={!request.pending}
        maxLength={200}
      />
      <ActionButton
        label={request.pending ? "Creating challenge…" : "Start challenge"}
        icon={Sparkles}
        loading={request.pending}
        onPress={handleGenerate}
      />
    </>
  );

  if (!result) {
    return (
      <Section>
        <Panel>
          <View style={styles.resetRow}>
            <ResetButton onPress={handleReset} accessibilityLabel="Reset form" />
          </View>
          {setupFields}
          <ErrorText message={request.error} />
          <ErrorText message={saveError ? SAVE_FAILED_MESSAGE : null} />
        </Panel>
      </Section>
    );
  }

  return (
    <Section>
      <ChallengeResult
        key={runKey}
        result={result}
        pending={request.pending}
        onNext={() => void handleGenerate()}
        onReset={handleReset}
      />
      <ErrorText message={request.error} />
      <ErrorText message={saveError ? SAVE_FAILED_MESSAGE : null} />
      <Disclosure title="Challenge settings" summary={`${form.level} · ${form.scenario}`}>
        {setupFields}
      </Disclosure>
    </Section>
  );
}

const styles = StyleSheet.create({
  resetRow: {
    flexDirection: "row",
    justifyContent: "flex-end",
  },
});

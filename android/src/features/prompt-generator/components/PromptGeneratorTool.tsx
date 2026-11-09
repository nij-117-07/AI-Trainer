// src/features/prompt-generator/components/PromptGeneratorTool.tsx
/** Prompt Generator form: scenario, optional context and style notes, and an optional seed to replicate a persona. */
import { Bot, RefreshCcw, Sparkles } from "lucide-react-native";
import { useAiSettings } from "@/features/ai-settings/providers/AiSettingsProvider";
import { ActionButton, ErrorText, Panel, TextField } from "@/components/tool/FormControls";
import { Section } from "@/components/tool/Section";
import { SectionTitle } from "@/components/tool/SectionTitle";
import { useRequest } from "@/hooks/useRequest";
import { usePersistedDraft } from "../hooks/usePersistedDraft";
import { PROMPT_GENERATOR_STORAGE_KEY } from "../lib/persistence";
import { generatePersona } from "../lib/generators";
import {
  CONTEXT_MAX,
  INSTRUCTIONS_MAX,
  PAST_PROMPT_MAX,
  REFERENCE_SAMPLES_MAX,
  SCENARIO_MAX,
  SEED_MAX,
} from "../lib/validate";
import type { PersonaResult, PromptGeneratorFormValues } from "../types";
import { PromptGeneratorResultView } from "./PromptGeneratorResult";

const DEFAULTS: PromptGeneratorFormValues = {
  scenario: "Financial Advisor",
  context: "Advises first-time investors",
  userInstructions: "Use plain language, avoid jargon",
  referenceSamples: "Friendly, patient tone",
  pastPrompt: "",
  seed: "",
};

export function PromptGeneratorTool() {
  const { settings } = useAiSettings();
  const { form, setForm, result, setResult, reset } = usePersistedDraft<PromptGeneratorFormValues, PersonaResult>(
    PROMPT_GENERATOR_STORAGE_KEY,
    DEFAULTS,
  );
  const request = useRequest(generatePersona);

  function update<K extends keyof PromptGeneratorFormValues>(key: K, value: PromptGeneratorFormValues[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function handleReset() {
    reset();
    request.reset();
  }

  async function handleGenerate() {
    const next = await request.run(settings, form);
    if (next) setResult(next);
  }

  return (
    <Section>
      <Panel>
        <TextField
          label="Scenario"
          placeholder="e.g. Financial Advisor"
          value={form.scenario}
          onChangeText={(text) => update("scenario", text)}
          editable={!request.pending}
          maxLength={SCENARIO_MAX}
        />
        <TextField
          label="Context (optional)"
          placeholder="Target audience or environment constraints…"
          value={form.context}
          onChangeText={(text) => update("context", text)}
          editable={!request.pending}
          maxLength={CONTEXT_MAX}
          multiline
          voice
        />
        <TextField
          label="User Instructions (optional)"
          placeholder="Dos and don'ts, stylistic preferences, personality traits…"
          value={form.userInstructions}
          onChangeText={(text) => update("userInstructions", text)}
          editable={!request.pending}
          maxLength={INSTRUCTIONS_MAX}
          multiline
          voice
        />
        <TextField
          label="Reference Samples (optional)"
          placeholder="One example per line of prompts or writing styles to emulate…"
          value={form.referenceSamples}
          onChangeText={(text) => update("referenceSamples", text)}
          editable={!request.pending}
          maxLength={REFERENCE_SAMPLES_MAX}
          multiline
          voice
        />
        <TextField
          label="Past Prompt (optional)"
          placeholder="A previous persona version to improve upon…"
          value={form.pastPrompt}
          onChangeText={(text) => update("pastPrompt", text)}
          editable={!request.pending}
          maxLength={PAST_PROMPT_MAX}
          multiline
          voice
        />
        <TextField
          label="Seed (optional)"
          placeholder="e.g. finadv2026"
          hint="Reuse the returned seed to replicate the persona."
          value={form.seed}
          onChangeText={(text) => update("seed", text)}
          editable={!request.pending}
          maxLength={SEED_MAX}
        />
        <ActionButton
          label={request.pending ? "Crafting persona…" : "Generate Persona"}
          icon={Sparkles}
          loading={request.pending}
          onPress={handleGenerate}
        />
      </Panel>

      <ErrorText message={request.error} />

      {result ? (
        <PromptGeneratorResultView result={result} />
      ) : (
        <SectionTitle icon={Bot} title="No persona yet" />
      )}

      <ActionButton label="Reset" icon={RefreshCcw} variant="outline" onPress={handleReset} />
    </Section>
  );
}

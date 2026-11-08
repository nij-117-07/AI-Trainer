// src/features/sentence-of-the-day/components/SentenceOfTheDayTool.tsx
/**
 * Sentence of the Day tool: the form for target and native language, context, and complexity,
 * with today's sentence below it. The draft and the last sentence are kept on the device.
 */
import { useEffect, useRef } from "react";
import { Quote, RefreshCcw, Sparkles } from "lucide-react-native";
import { useAiSettings } from "@/features/ai-settings/providers/AiSettingsProvider";
import { ActionButton, ErrorText, Panel, TextField } from "@/components/tool/FormControls";
import { SelectField } from "@/components/tool/SelectField";
import { Section } from "@/components/tool/Section";
import { useRequest } from "@/hooks/useRequest";
import { generateSentenceOfTheDay } from "../lib/generators";
import { usePersistedTool } from "../hooks/usePersistedTool";
import {
  COMPLEXITY_LEVEL_OPTIONS,
  CONTEXT_SETTING_OPTIONS,
  SENTENCE_DEFAULTS,
} from "../options";
import type { SentenceFormValues, SentenceOfTheDay } from "../types";
import { SentenceResultView } from "./SentenceResultView";

const STORAGE_KEY = "language-learner.sentence-of-the-day.generate.v1";

export function SentenceOfTheDayTool() {
  const { settings } = useAiSettings();
  const { form, setForm, result, setResult, reset } = usePersistedTool<SentenceFormValues, SentenceOfTheDay>(
    STORAGE_KEY,
    SENTENCE_DEFAULTS,
  );
  const request = useRequest(generateSentenceOfTheDay);
  const controller = useRef<AbortController | null>(null);

  useEffect(() => () => controller.current?.abort(), []);

  function update<K extends keyof SentenceFormValues>(key: K, value: SentenceFormValues[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function handleReset() {
    controller.current?.abort();
    reset();
    request.reset();
  }

  async function handleGenerate() {
    const current = new AbortController();
    controller.current = current;
    const next = await request.run(settings, form, current.signal);
    if (next && !current.signal.aborted) setResult(next);
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
          label="Context setting"
          options={CONTEXT_SETTING_OPTIONS}
          value={form.contextSetting}
          onChange={(value) => update("contextSetting", value)}
          allowCustom={false}
        />
        <SelectField
          label="Complexity level"
          options={COMPLEXITY_LEVEL_OPTIONS}
          value={form.complexityLevel}
          onChange={(value) => update("complexityLevel", value)}
          allowCustom={false}
        />
        <ActionButton
          label={request.pending ? "Choosing today's sentence…" : "Get sentence of the day"}
          icon={Sparkles}
          loading={request.pending}
          onPress={handleGenerate}
        />
      </Panel>

      <ErrorText message={request.error} />

      {result && <SentenceResultView sentence={result} />}

      <ActionButton label="Reset" icon={RefreshCcw} variant="outline" onPress={handleReset} />
    </Section>
  );
}

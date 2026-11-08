// src/features/word-of-the-day/components/WordOfTheDayTool.tsx
/** Word of the Day: one word from a target language with its pronunciation, roots, history, and usage. */
import { useEffect, useRef } from "react";
import { StyleSheet, Text } from "react-native";
import { RefreshCcw, Sparkles } from "lucide-react-native";
import { useThemeColors } from "@/theme";
import { useAiSettings } from "@/features/ai-settings/providers/AiSettingsProvider";
import { ActionButton, ErrorText, Panel, TextField } from "@/components/tool/FormControls";
import { SelectField } from "@/components/tool/SelectField";
import { Section } from "@/components/tool/Section";
import { useRequest } from "@/hooks/useRequest";
import { generateWordOfTheDay } from "../lib/generators";
import { WORD_OF_THE_DAY_STORAGE_KEY } from "../lib/persistence";
import { PROFICIENCY_OPTIONS, WORD_OF_THE_DAY_DEFAULTS } from "../options";
import { usePersistedDraft } from "../hooks/usePersistedDraft";
import type { WordOfTheDay, WordOfTheDayFormValues } from "../types";
import { WordOfTheDayView } from "./WordOfTheDayView";

const DEFAULTS: WordOfTheDayFormValues = WORD_OF_THE_DAY_DEFAULTS;

export function WordOfTheDayTool() {
  const colors = useThemeColors();
  const { settings } = useAiSettings();
  const { form, setForm, result, setResult, reset } = usePersistedDraft<WordOfTheDayFormValues, WordOfTheDay>(
    WORD_OF_THE_DAY_STORAGE_KEY,
    DEFAULTS,
  );
  const request = useRequest(generateWordOfTheDay);
  const controllerRef = useRef<AbortController | null>(null);

  useEffect(() => () => controllerRef.current?.abort(), []);

  function update<K extends keyof WordOfTheDayFormValues>(key: K, value: WordOfTheDayFormValues[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function handleReset() {
    controllerRef.current?.abort();
    controllerRef.current = null;
    reset();
    request.reset();
  }

  async function handleGenerate() {
    controllerRef.current?.abort();
    const controller = new AbortController();
    controllerRef.current = controller;
    const next = await request.run(settings, form, controller.signal);
    if (next && !controller.signal.aborted) setResult(next);
  }

  const errorMessage = controllerRef.current ? request.error : null;

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
          label="Word type"
          options={PROFICIENCY_OPTIONS}
          value={form.userProficiency}
          onChange={(value) => update("userProficiency", value)}
          allowCustom={false}
        />
        <TextField
          label="Theme"
          placeholder="e.g. Nature, Technology, General"
          value={form.thematicFocus}
          onChangeText={(text) => update("thematicFocus", text)}
          editable={!request.pending}
          maxLength={200}
        />
        <TextField
          label="Custom instructions (optional)"
          placeholder="e.g. untranslatable words only…"
          hint="Optional."
          value={form.customInstructions}
          onChangeText={(text) => update("customInstructions", text)}
          editable={!request.pending}
          maxLength={1000}
          multiline
        />
        <ActionButton
          label={request.pending ? "Choosing today's word…" : "Get Word of the Day"}
          icon={Sparkles}
          loading={request.pending}
          onPress={handleGenerate}
        />
      </Panel>

      <ErrorText message={errorMessage} />

      {result ? (
        <WordOfTheDayView word={result} />
      ) : (
        <Text style={[styles.empty, { color: colors.mutedForeground }]}>
          Pick a language and generate to get today's word with its full story.
        </Text>
      )}

      <ActionButton label="Reset" icon={RefreshCcw} variant="outline" onPress={handleReset} />
    </Section>
  );
}

const styles = StyleSheet.create({
  empty: {
    fontSize: 14,
    lineHeight: 20,
  },
});

// src/features/idioms/components/IdiomsTool.tsx
/** Idioms: one expression in a target language, with meaning, culture, pronunciation, and practice. */
import { useEffect, useRef } from "react";
import { StyleSheet, Text } from "react-native";
import { RefreshCcw, Sparkles } from "lucide-react-native";
import { useThemeColors } from "@/theme";
import { useAiSettings } from "@/features/ai-settings/providers/AiSettingsProvider";
import { ActionButton, ErrorText, Panel, TextField } from "@/components/tool/FormControls";
import { SelectField } from "@/components/tool/SelectField";
import { Section } from "@/components/tool/Section";
import { useRequest } from "@/hooks/useRequest";
import { generateIdiomLesson } from "../lib/generators";
import { IDIOMS_STORAGE_KEY } from "../lib/persistence";
import { IDIOMS_DEFAULTS, PROFICIENCY_OPTIONS } from "../options";
import { usePersistedDraft } from "../hooks/usePersistedDraft";
import type { IdiomLesson, IdiomsFormValues } from "../types";
import { IdiomLessonView } from "./IdiomLessonView";

const DEFAULTS: IdiomsFormValues = IDIOMS_DEFAULTS;

export function IdiomsTool() {
  const colors = useThemeColors();
  const { settings } = useAiSettings();
  const { form, setForm, result, setResult, reset } = usePersistedDraft<IdiomsFormValues, IdiomLesson>(
    IDIOMS_STORAGE_KEY,
    DEFAULTS,
  );
  const request = useRequest(generateIdiomLesson);
  const controllerRef = useRef<AbortController | null>(null);

  useEffect(() => () => controllerRef.current?.abort(), []);

  function update<K extends keyof IdiomsFormValues>(key: K, value: IdiomsFormValues[K]) {
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
          placeholder="e.g. French"
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
          label="Your proficiency"
          options={PROFICIENCY_OPTIONS}
          value={form.userProficiency}
          onChange={(value) => update("userProficiency", value)}
          allowCustom={false}
        />
        <TextField
          label="Theme or keyword"
          placeholder="e.g. Success and Hard Work"
          value={form.themeOrKeyword}
          onChangeText={(text) => update("themeOrKeyword", text)}
          editable={!request.pending}
          maxLength={200}
        />
        <TextField
          label="Custom request (optional)"
          placeholder="e.g. make it funny, focus on workplace use…"
          hint="Optional."
          value={form.customUserRequest}
          onChangeText={(text) => update("customUserRequest", text)}
          editable={!request.pending}
          maxLength={1000}
          multiline
        />
        <TextField
          label="Seed (rotation)"
          placeholder="Leave blank to auto-generate"
          hint="Change this to rotate among different idioms for the same theme."
          value={form.seed}
          onChangeText={(text) => update("seed", text)}
          editable={!request.pending}
          maxLength={200}
        />
        <ActionButton
          label={request.pending ? "Finding the perfect idiom…" : "Generate an idiom"}
          icon={Sparkles}
          loading={request.pending}
          onPress={handleGenerate}
        />
      </Panel>

      <ErrorText message={errorMessage} />

      {result ? (
        <IdiomLessonView lesson={result} nativeLanguage={form.nativeLanguage} />
      ) : (
        <Text style={[styles.empty, { color: colors.mutedForeground }]}>
          Pick a language and theme, then generate to learn an idiomatic expression with context.
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

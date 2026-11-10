// src/features/word-of-the-day/components/WordOfTheDayForm.tsx
/**
 * Word of the Day form, shown on its own page. The fields fill the page body; the button is pinned
 * in the footer. A successful generate saves the word and calls onGenerated, which returns to the
 * Word of the Day page.
 */
import { useEffect, useRef } from "react";
import { StyleSheet, View } from "react-native";
import { Sparkles } from "lucide-react-native";
import { spacing } from "@/theme";
import { useAiSettings } from "@/features/ai-settings/providers/AiSettingsProvider";
import { useLanguageProfiles } from "@/features/language-profiles/providers/LanguageProfilesProvider";
import { languagePair } from "@/features/language-profiles/lib/profiles";
import { ActionButton, ErrorText, TextField } from "@/components/tool/FormControls";
import { SelectField } from "@/components/tool/SelectField";
import { useRequest } from "@/hooks/useRequest";
import { saveDocument } from "@/lib/document-store";
import { generateWordOfTheDay } from "../lib/generators";
import { WORD_OF_THE_DAY_RESULT_KEY } from "../lib/persistence";
import { PROFICIENCY_OPTIONS, WORD_OF_THE_DAY_DEFAULTS } from "../options";
import { usePersistedForm } from "../hooks/usePersistedDraft";
import type { WordOfTheDayFormValues } from "../types";

export interface WordOfTheDayFormState {
  form: WordOfTheDayFormValues;
  pending: boolean;
  error: string | null;
  update: <K extends keyof WordOfTheDayFormValues>(key: K, value: WordOfTheDayFormValues[K]) => void;
  submit: () => Promise<void>;
  reset: () => void;
}

export function useWordOfTheDayForm(onGenerated: () => void): WordOfTheDayFormState {
  const { settings } = useAiSettings();
  const { activeProfile } = useLanguageProfiles();
  const { form, setForm, reset: resetForm } = usePersistedForm<WordOfTheDayFormValues>(WORD_OF_THE_DAY_DEFAULTS);
  const request = useRequest(generateWordOfTheDay);
  const controllerRef = useRef<AbortController | null>(null);

  useEffect(() => () => controllerRef.current?.abort(), []);

  function update<K extends keyof WordOfTheDayFormValues>(key: K, value: WordOfTheDayFormValues[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function reset() {
    controllerRef.current?.abort();
    controllerRef.current = null;
    resetForm();
    request.reset();
  }

  async function submit() {
    controllerRef.current?.abort();
    const controller = new AbortController();
    controllerRef.current = controller;
    const word = await request.run(settings, { ...form, ...languagePair(activeProfile) }, controller.signal);
    if (!word || controller.signal.aborted) return;
    await saveDocument(WORD_OF_THE_DAY_RESULT_KEY, word).catch(() => undefined);
    onGenerated();
  }

  return {
    form,
    pending: request.pending,
    error: request.error,
    update,
    submit,
    reset,
  };
}

export function WordOfTheDayFormFields({ word }: { word: WordOfTheDayFormState }) {
  const { form, pending, update } = word;

  return (
    <>
      <SelectField
        label="Word type"
        options={PROFICIENCY_OPTIONS}
        value={form.userProficiency}
        onChange={(value) => update("userProficiency", value)}
        customPlaceholder="e.g. Idiomatic, Regional, Technical"
      />
      <TextField
        label="Theme"
        placeholder="e.g. Nature, Technology, General"
        value={form.thematicFocus}
        onChangeText={(text) => update("thematicFocus", text)}
        editable={!pending}
        maxLength={200}
      />
      <TextField
        label="User instructions (optional)"
        placeholder="e.g. untranslatable words only…"
        value={form.customInstructions}
        onChangeText={(text) => update("customInstructions", text)}
        editable={!pending}
        maxLength={1000}
        multiline
        voice
      />
    </>
  );
}

export function WordOfTheDayFormFooter({ word }: { word: WordOfTheDayFormState }) {
  const { pending, error, submit } = word;

  return (
    <View style={styles.footer}>
      <ErrorText message={error} />
      <ActionButton
        label={pending ? "Choosing today's word…" : "Get Word of the Day"}
        icon={Sparkles}
        loading={pending}
        onPress={submit}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  footer: {
    gap: spacing.md,
  },
});

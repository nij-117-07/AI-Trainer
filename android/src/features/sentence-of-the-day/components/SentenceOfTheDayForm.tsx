// src/features/sentence-of-the-day/components/SentenceOfTheDayForm.tsx
/**
 * Sentence of the Day form, shown on its own page. The fields fill the page body; the button is
 * pinned in the footer. A successful generate saves the sentence and calls onGenerated, which
 * returns to the Sentence of the Day page.
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
import { generateSentenceOfTheDay } from "../lib/generators";
import { SENTENCE_RESULT_KEY } from "../lib/persistence";
import { usePersistedForm } from "../hooks/usePersistedDraft";
import { COMPLEXITY_LEVEL_OPTIONS, CONTEXT_SETTING_OPTIONS, SENTENCE_DEFAULTS } from "../options";
import type { SentenceFormValues } from "../types";

export interface SentenceFormState {
  form: SentenceFormValues;
  pending: boolean;
  error: string | null;
  update: <K extends keyof SentenceFormValues>(key: K, value: SentenceFormValues[K]) => void;
  submit: () => Promise<void>;
  reset: () => void;
}

export function useSentenceForm(onGenerated: () => void): SentenceFormState {
  const { settings } = useAiSettings();
  const { activeProfile } = useLanguageProfiles();
  const { form, setForm, reset: resetForm } = usePersistedForm<SentenceFormValues>(SENTENCE_DEFAULTS);
  const request = useRequest(generateSentenceOfTheDay);
  const controllerRef = useRef<AbortController | null>(null);

  useEffect(() => () => controllerRef.current?.abort(), []);

  function update<K extends keyof SentenceFormValues>(key: K, value: SentenceFormValues[K]) {
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
    const sentence = await request.run(settings, { ...form, ...languagePair(activeProfile) }, controller.signal);
    if (!sentence || controller.signal.aborted) return;
    await saveDocument(SENTENCE_RESULT_KEY, sentence).catch(() => undefined);
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

export function SentenceFormFields({ sentence }: { sentence: SentenceFormState }) {
  const { form, pending, update } = sentence;

  return (
    <>
      <SelectField
        label="Context setting"
        options={CONTEXT_SETTING_OPTIONS}
        value={form.contextSetting}
        onChange={(value) => update("contextSetting", value)}
        customPlaceholder="e.g. Medical, Sports, Customer support"
      />
      <SelectField
        label="Complexity level"
        options={COMPLEXITY_LEVEL_OPTIONS}
        value={form.complexityLevel}
        onChange={(value) => update("complexityLevel", value)}
        customPlaceholder="e.g. Child-friendly, Expert"
      />
      <TextField
        label="User instructions (optional)"
        placeholder="e.g. use a kitchen setting, keep it under 10 words…"
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

export function SentenceFormFooter({ sentence }: { sentence: SentenceFormState }) {
  const { pending, error, submit } = sentence;

  return (
    <View style={styles.footer}>
      <ErrorText message={error} />
      <ActionButton
        label={pending ? "Choosing today's sentence…" : "Get sentence of the day"}
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

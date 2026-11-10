// src/features/idioms/components/IdiomsForm.tsx
/**
 * Idioms form, shown on its own page. The fields fill the page body; the generate button is
 * pinned in the footer. A successful generate saves the lesson and calls onGenerated, which
 * returns to the Idioms page.
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
import { generateIdiomLesson } from "../lib/generators";
import { IDIOMS_LESSON_KEY } from "../lib/persistence";
import { IDIOMS_DEFAULTS, PROFICIENCY_OPTIONS } from "../options";
import { usePersistedForm } from "../hooks/usePersistedDraft";
import type { IdiomsFormValues } from "../types";

export interface IdiomFormState {
  form: IdiomsFormValues;
  pending: boolean;
  error: string | null;
  update: <K extends keyof IdiomsFormValues>(key: K, value: IdiomsFormValues[K]) => void;
  submit: () => Promise<void>;
  reset: () => void;
}

export function useIdiomForm(onGenerated: () => void): IdiomFormState {
  const { settings } = useAiSettings();
  const { activeProfile } = useLanguageProfiles();
  const { form, setForm, reset: resetForm } = usePersistedForm<IdiomsFormValues>(IDIOMS_DEFAULTS);
  const request = useRequest(generateIdiomLesson);
  const controllerRef = useRef<AbortController | null>(null);

  useEffect(() => () => controllerRef.current?.abort(), []);

  function update<K extends keyof IdiomsFormValues>(key: K, value: IdiomsFormValues[K]) {
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
    const lesson = await request.run(settings, { ...form, ...languagePair(activeProfile) }, controller.signal);
    if (!lesson || controller.signal.aborted) return;
    await saveDocument(IDIOMS_LESSON_KEY, lesson).catch(() => undefined);
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

export function IdiomsFormFields({ idioms }: { idioms: IdiomFormState }) {
  const { form, pending, update } = idioms;

  return (
    <>
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
        editable={!pending}
        maxLength={200}
      />
      <TextField
        label="Custom request (optional)"
        placeholder="e.g. make it funny, focus on workplace use…"
        value={form.customUserRequest}
        onChangeText={(text) => update("customUserRequest", text)}
        editable={!pending}
        maxLength={1000}
        multiline
        voice
      />
      <TextField
        label="Seed (optional)"
        placeholder="Leave blank to auto-generate"
        hint="Change this to rotate among different idioms for the same theme."
        value={form.seed}
        onChangeText={(text) => update("seed", text)}
        editable={!pending}
        maxLength={200}
      />
    </>
  );
}

export function IdiomsFormFooter({ idioms }: { idioms: IdiomFormState }) {
  const { pending, error, submit } = idioms;

  return (
    <View style={styles.footer}>
      <ErrorText message={error} />
      <ActionButton
        label={pending ? "Finding the perfect idiom…" : "Generate an idiom"}
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

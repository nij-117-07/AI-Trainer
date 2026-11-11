// src/features/idioms/components/IdiomsForm.tsx
/**
 * Idioms form, shown on its own page. The topic, level, and instructions fill the page body, with
 * the seed under More options. The generate button is pinned in the footer. A successful generate
 * saves the lesson and calls onGenerated, which returns to the Idioms page.
 */
import { useEffect, useRef } from "react";
import { StyleSheet, View } from "react-native";
import { SlidersHorizontal, Sparkles } from "lucide-react-native";
import { spacing } from "@/theme";
import { useAiSettings } from "@/features/ai-settings/providers/AiSettingsProvider";
import { useLanguageProfiles } from "@/features/language-profiles/providers/LanguageProfilesProvider";
import { languagePair } from "@/features/language-profiles/lib/profiles";
import { ActionButton, ChoiceChips, ErrorText, Field, Panel, TextField } from "@/components/tool/FormControls";
import { Disclosure } from "@/components/tool/Disclosure";
import { useRequest } from "@/hooks/useRequest";
import { generateIdiomLesson } from "../lib/generators";
import { IDIOMS_LESSON_KEY, SAVE_FAILED_MESSAGE } from "../lib/persistence";
import { saveResult } from "../lib/result-store";
import { IDIOMS_DEFAULTS, PROFICIENCY_OPTIONS } from "../options";
import { usePersistedForm } from "../hooks/usePersistedDraft";
import type { IdiomsFormValues } from "../types";

export interface IdiomFormState {
  form: IdiomsFormValues;
  pending: boolean;
  error: string | null;
  saveError: boolean;
  update: <K extends keyof IdiomsFormValues>(key: K, value: IdiomsFormValues[K]) => void;
  submit: () => Promise<void>;
  reset: () => void;
}

export function useIdiomForm(onGenerated: () => void): IdiomFormState {
  const { settings } = useAiSettings();
  const { activeProfile } = useLanguageProfiles();
  const { form, setForm, reset: resetForm, saveError } = usePersistedForm<IdiomsFormValues>(IDIOMS_DEFAULTS);
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
    await saveResult(IDIOMS_LESSON_KEY, lesson);
    onGenerated();
  }

  return {
    form,
    pending: request.pending,
    error: request.error,
    saveError,
    update,
    submit,
    reset,
  };
}

export function IdiomsFormFields({ idioms }: { idioms: IdiomFormState }) {
  const { form, pending, update } = idioms;
  const seed = form.seed.trim();

  return (
    <>
      <Panel>
        <TextField
          label="Theme or keyword"
          placeholder="e.g. Success and Hard Work"
          value={form.themeOrKeyword}
          onChangeText={(text) => update("themeOrKeyword", text)}
          editable={!pending}
          maxLength={200}
        />
        <Field label="Your level">
          <ChoiceChips
            options={PROFICIENCY_OPTIONS}
            value={form.userProficiency}
            onChange={(value) => update("userProficiency", value)}
            disabled={pending}
          />
        </Field>
        <TextField
          label="Instructions (optional)"
          placeholder="e.g. make it funny, focus on workplace use…"
          value={form.customUserRequest}
          onChangeText={(text) => update("customUserRequest", text)}
          editable={!pending}
          maxLength={1000}
          multiline
          voice
        />
      </Panel>
      <Disclosure icon={SlidersHorizontal} title="More options" summary={seed ? `Seed: ${seed}` : "Seed: automatic"}>
        <TextField
          label="Seed (optional)"
          placeholder="e.g. 42"
          hint="Change this to rotate among different idioms for the same theme."
          value={form.seed}
          onChangeText={(text) => update("seed", text)}
          editable={!pending}
          maxLength={200}
        />
      </Disclosure>
    </>
  );
}

export function IdiomsFormFooter({ idioms }: { idioms: IdiomFormState }) {
  const { pending, error, saveError, submit } = idioms;

  return (
    <View style={styles.footer}>
      <ErrorText message={error} />
      <ErrorText message={saveError ? SAVE_FAILED_MESSAGE : null} />
      <ActionButton
        label={pending ? "Explaining idiom…" : "Explain idiom"}
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

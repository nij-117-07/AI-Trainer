// src/features/lesson/components/LessonForm.tsx
/**
 * Language Lesson form, shown on its own page. The fields fill the page body; the generate button
 * is pinned in the footer. A successful generate saves the lesson and calls onGenerated, which
 * returns to the Language Lesson page.
 */
import { useEffect, useRef } from "react";
import { StyleSheet, View } from "react-native";
import { Sparkles } from "lucide-react-native";
import { spacing } from "@/theme";
import { useAiSettings } from "@/features/ai-settings/providers/AiSettingsProvider";
import { useLanguageProfiles } from "@/features/language-profiles/providers/LanguageProfilesProvider";
import { languagePair } from "@/features/language-profiles/lib/profiles";
import { ActionButton, ChoiceChips, ErrorText, Field, TextField } from "@/components/tool/FormControls";
import { useRequest } from "@/hooks/useRequest";
import { generateLesson } from "../lib/generators";
import { LESSON_RESULT_KEY, SAVE_FAILED_MESSAGE } from "../lib/persistence";
import { saveResult } from "../lib/result-store";
import { COMPLEXITY_WEIGHT_OPTIONS, CEFR_LEVEL_OPTIONS, LEARNING_FOCUS_OPTIONS, LESSON_DEFAULTS } from "../options";
import { usePersistedForm } from "../hooks/usePersistedDraft";
import type { LessonFormValues } from "../types";

export interface LessonFormState {
  form: LessonFormValues;
  pending: boolean;
  error: string | null;
  saveError: boolean;
  update: <K extends keyof LessonFormValues>(key: K, value: LessonFormValues[K]) => void;
  submit: () => Promise<void>;
  reset: () => void;
}

export function useLessonForm(onGenerated: () => void): LessonFormState {
  const { settings } = useAiSettings();
  const { activeProfile } = useLanguageProfiles();
  const { form, setForm, reset: resetForm, saveError } = usePersistedForm<LessonFormValues>(LESSON_DEFAULTS);
  const request = useRequest(generateLesson);
  const controllerRef = useRef<AbortController | null>(null);

  useEffect(() => () => controllerRef.current?.abort(), []);

  function update<K extends keyof LessonFormValues>(key: K, value: LessonFormValues[K]) {
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
    await saveResult(LESSON_RESULT_KEY, lesson);
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

export function LessonFormFields({ lesson }: { lesson: LessonFormState }) {
  const { form, pending, update } = lesson;

  return (
    <>
      <Field label="Current level">
        <ChoiceChips
          options={CEFR_LEVEL_OPTIONS}
          value={form.currentLevel}
          onChange={(value) => update("currentLevel", value)}
          disabled={pending}
        />
      </Field>
      <Field label="Learning focus">
        <ChoiceChips
          options={LEARNING_FOCUS_OPTIONS}
          value={form.learningFocus}
          onChange={(value) => update("learningFocus", value)}
          disabled={pending}
        />
      </Field>
      <Field label="Lesson length">
        <ChoiceChips
          options={COMPLEXITY_WEIGHT_OPTIONS}
          value={form.complexityWeight}
          onChange={(value) => update("complexityWeight", value)}
          disabled={pending}
        />
      </Field>
      <TextField
        label="Last lesson summary (optional)"
        placeholder="Recap of previous concepts…"
        value={form.lastLessonSummary}
        onChangeText={(text) => update("lastLessonSummary", text)}
        editable={!pending}
        maxLength={2000}
        multiline
        voice
      />
      <TextField
        label="User instructions (optional)"
        placeholder="e.g. Cyberpunk setting, focus on food vocabulary…"
        value={form.userCustomInstruction}
        onChangeText={(text) => update("userCustomInstruction", text)}
        editable={!pending}
        maxLength={1000}
        multiline
        voice
      />
      <TextField
        label="Seed (optional)"
        placeholder="Leave blank to auto-generate"
        hint="Change this for a different lesson with the same inputs."
        value={form.seed}
        onChangeText={(text) => update("seed", text)}
        editable={!pending}
        maxLength={200}
      />
    </>
  );
}

export function LessonFormFooter({ lesson }: { lesson: LessonFormState }) {
  const { pending, error, saveError, submit } = lesson;

  return (
    <View style={styles.footer}>
      <ErrorText message={error} />
      <ErrorText message={saveError ? SAVE_FAILED_MESSAGE : null} />
      <ActionButton
        label={pending ? "Creating lesson…" : "Create lesson"}
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

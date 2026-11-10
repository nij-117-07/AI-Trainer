// src/features/creative-assets/components/CreativeAssetsForm.tsx
/**
 * Creative Assets form, shown on its own page. The fields fill the page body; the generate
 * button is pinned in the footer. A successful generate saves the result and calls onGenerated,
 * which returns to the Creative Assets page.
 */
import { useEffect, useRef } from "react";
import { StyleSheet, View } from "react-native";
import { Sparkles } from "lucide-react-native";
import { spacing } from "@/theme";
import { useAiSettings } from "@/features/ai-settings/providers/AiSettingsProvider";
import { ActionButton, ErrorText, TextField } from "@/components/tool/FormControls";
import { CountSlider } from "@/components/tool/CountSlider";
import { SelectField } from "@/components/tool/SelectField";
import { useRequest } from "@/hooks/useRequest";
import { generateCreativeAssets } from "../lib/generators";
import { newBatch } from "../lib/batches";
import { TASK_TYPE_OPTIONS } from "../options";
import { saveCreativeAssetsResult, usePersistedForm } from "../hooks/usePersistedDraft";
import type { CreativeAssetsFormValues } from "../types";

export interface CreativeAssetsFormState {
  form: CreativeAssetsFormValues;
  pending: boolean;
  error: string | null;
  update: <K extends keyof CreativeAssetsFormValues>(key: K, value: CreativeAssetsFormValues[K]) => void;
  submit: () => Promise<void>;
  reset: () => void;
}

export function useCreativeAssetsForm(onGenerated: () => void): CreativeAssetsFormState {
  const { settings } = useAiSettings();
  const { form, setForm, reset: resetForm } = usePersistedForm();
  const request = useRequest(generateCreativeAssets);
  const controllerRef = useRef<AbortController | null>(null);

  useEffect(() => () => controllerRef.current?.abort(), []);

  function update<K extends keyof CreativeAssetsFormValues>(key: K, value: CreativeAssetsFormValues[K]) {
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
    const suggestions = await request.run(settings, form, controller.signal);
    if (!suggestions || controller.signal.aborted) return;
    const batch = newBatch("Batch 1", suggestions, false);
    await saveCreativeAssetsResult({ form, rounds: 1, batches: [batch] }).catch(() => undefined);
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

export function CreativeAssetsFormFields({ assets }: { assets: CreativeAssetsFormState }) {
  const { form, pending, update } = assets;

  return (
    <>
      <SelectField
        label="Task type"
        options={TASK_TYPE_OPTIONS}
        value={form.taskType}
        onChange={(value) => update("taskType", value)}
        customPlaceholder="e.g. Podcast Titles, Event Names"
      />
      <TextField
        label="Topic / product description"
        placeholder="e.g. Eco-friendly bamboo toothbrushes"
        value={form.userQuery}
        onChangeText={(text) => update("userQuery", text)}
        editable={!pending}
        maxLength={2000}
        multiline
        voice
      />
      <TextField
        label="Context (optional)"
        placeholder="e.g. Targeting Gen Z on Instagram who care about zero-waste living."
        value={form.context}
        onChangeText={(text) => update("context", text)}
        editable={!pending}
        maxLength={2000}
        multiline
        voice
      />
      <TextField
        label="Reference examples (optional)"
        placeholder="e.g. #SustainableLiving, one per line"
        value={form.referenceExamples}
        onChangeText={(text) => update("referenceExamples", text)}
        editable={!pending}
        maxLength={3000}
        multiline
      />
      <CountSlider
        label="Number of suggestions"
        max={20}
        value={form.numberOfSuggestions}
        onChange={(value) => update("numberOfSuggestions", value)}
      />
    </>
  );
}

export function CreativeAssetsFormFooter({ assets }: { assets: CreativeAssetsFormState }) {
  const { pending, error, submit } = assets;

  return (
    <View style={styles.footer}>
      <ErrorText message={error} />
      <ActionButton
        label={pending ? "Brainstorming…" : "Generate assets"}
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

// src/features/topic-of-the-day/components/TopicOfTheDayForm.tsx
/**
 * Topic of the Day form, shown on its own page. The fields fill the page body; the button is pinned
 * in the footer. A successful generate saves the topic and calls onGenerated, which returns to the
 * Topic of the Day page.
 */
import { useEffect, useRef } from "react";
import { StyleSheet, View } from "react-native";
import { CalendarDays } from "lucide-react-native";
import { spacing } from "@/theme";
import { useAiSettings } from "@/features/ai-settings/providers/AiSettingsProvider";
import { ActionButton, ErrorText, TextField } from "@/components/tool/FormControls";
import { SelectField } from "@/components/tool/SelectField";
import { useRequest } from "@/hooks/useRequest";
import { saveDocument } from "@/lib/document-store";
import { generateTopicOfTheDay } from "../lib/generators";
import { TOPIC_OF_THE_DAY_RESULT_KEY } from "../lib/persistence";
import { LEVEL_OPTIONS, TOPIC_OF_THE_DAY_DEFAULTS, TOPIC_OF_THE_DAY_LIMITS } from "../options";
import { usePersistedForm } from "../hooks/usePersistedDraft";
import type { TopicOfTheDayFormValues } from "../types";

export interface TopicOfTheDayFormState {
  form: TopicOfTheDayFormValues;
  pending: boolean;
  error: string | null;
  update: <K extends keyof TopicOfTheDayFormValues>(key: K, value: TopicOfTheDayFormValues[K]) => void;
  submit: () => Promise<void>;
  reset: () => void;
}

export function useTopicOfTheDayForm(onGenerated: () => void): TopicOfTheDayFormState {
  const { settings } = useAiSettings();
  const { form, setForm, reset: resetForm } = usePersistedForm<TopicOfTheDayFormValues>(TOPIC_OF_THE_DAY_DEFAULTS);
  const request = useRequest(generateTopicOfTheDay);
  const controllerRef = useRef<AbortController | null>(null);

  useEffect(() => () => controllerRef.current?.abort(), []);

  function update<K extends keyof TopicOfTheDayFormValues>(key: K, value: TopicOfTheDayFormValues[K]) {
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
    const topic = await request.run(settings, form, controller.signal);
    if (!topic || controller.signal.aborted) return;
    await saveDocument(TOPIC_OF_THE_DAY_RESULT_KEY, topic).catch(() => undefined);
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

export function TopicOfTheDayFormFields({ topic }: { topic: TopicOfTheDayFormState }) {
  const { form, pending, update } = topic;

  return (
    <>
      <TextField
        label="Subject"
        placeholder="e.g. Photosynthesis, Supply and demand, Git branching"
        value={form.subject}
        onChangeText={(text) => update("subject", text)}
        editable={!pending}
        maxLength={TOPIC_OF_THE_DAY_LIMITS.subject}
      />
      <SelectField
        label="Level"
        options={LEVEL_OPTIONS}
        value={form.level}
        onChange={(value) => update("level", value)}
        customPlaceholder="e.g. Exam-ready, Self-taught"
      />
      <TextField
        label="Context (optional)"
        placeholder="e.g. I have a biology exam next week"
        value={form.context}
        onChangeText={(text) => update("context", text)}
        editable={!pending}
        maxLength={TOPIC_OF_THE_DAY_LIMITS.context}
      />
      <TextField
        label="User instructions (optional)"
        placeholder="e.g. focus on everyday examples…"
        value={form.customInstructions}
        onChangeText={(text) => update("customInstructions", text)}
        editable={!pending}
        maxLength={TOPIC_OF_THE_DAY_LIMITS.customInstructions}
        multiline
        voice
      />
    </>
  );
}

export function TopicOfTheDayFormFooter({ topic }: { topic: TopicOfTheDayFormState }) {
  const { pending, error, submit } = topic;

  return (
    <View style={styles.footer}>
      <ErrorText message={error} />
      <ActionButton
        label={pending ? "Choosing today's topic…" : "Get topic of the day"}
        icon={CalendarDays}
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

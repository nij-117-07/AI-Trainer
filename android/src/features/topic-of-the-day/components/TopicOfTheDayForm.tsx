// src/features/topic-of-the-day/components/TopicOfTheDayForm.tsx
/**
 * Topic form, shown on its own page for one broader topic. The fields fill the page body; the
 * button is pinned in the footer. A successful generate saves the topic under its broader topic and
 * calls onGenerated, which returns to that broader topic's page.
 */
import { useEffect, useRef, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { CalendarDays } from "lucide-react-native";
import { shape, spacing, typeScale, useThemeColors } from "@/theme";
import { useAiSettings } from "@/features/ai-settings/providers/AiSettingsProvider";
import { ActionButton, ErrorText, Field, TextField } from "@/components/tool/FormControls";
import { SelectField } from "@/components/tool/SelectField";
import { useRequest } from "@/hooks/useRequest";
import { generateTopicOfTheDay } from "../lib/generators";
import { addTopic, newId } from "../lib/library";
import { changeTopicLibrary } from "../lib/persistence";
import { LEVEL_OPTIONS, TOPIC_OF_THE_DAY_DEFAULTS, TOPIC_OF_THE_DAY_LIMITS } from "../options";
import { usePersistedForm } from "../hooks/usePersistedDraft";
import type { BroadTopic, TopicOfTheDayFormValues } from "../types";

export interface TopicOfTheDayFormState {
  form: TopicOfTheDayFormValues;
  pending: boolean;
  error: string | null;
  update: <K extends keyof TopicOfTheDayFormValues>(key: K, value: TopicOfTheDayFormValues[K]) => void;
  submit: () => Promise<void>;
  reset: () => void;
}

export function useTopicOfTheDayForm(broad: BroadTopic | undefined, onGenerated: () => void): TopicOfTheDayFormState {
  const { settings } = useAiSettings();
  const { form, setForm, reset: resetForm } = usePersistedForm<TopicOfTheDayFormValues>(TOPIC_OF_THE_DAY_DEFAULTS);
  const request = useRequest(generateTopicOfTheDay);
  const [saveError, setSaveError] = useState<string | null>(null);
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
    setSaveError(null);
  }

  async function submit() {
    if (!broad) return;
    controllerRef.current?.abort();
    const controller = new AbortController();
    controllerRef.current = controller;
    setSaveError(null);
    const content = await request.run(settings, broad.name, form, controller.signal);
    if (!content || controller.signal.aborted) return;
    try {
      const focus = form.focus.trim();
      await changeTopicLibrary((library) =>
        addTopic(library, { ...content, id: newId("topic"), broadId: broad.id, focus, createdAt: Date.now() }),
      );
    } catch {
      setSaveError("Could not save the topic. Please try again.");
      return;
    }
    onGenerated();
  }

  return {
    form,
    pending: request.pending,
    error: request.error ?? saveError,
    update,
    submit,
    reset,
  };
}

export function TopicOfTheDayFormFields({ topic, broad }: { topic: TopicOfTheDayFormState; broad: BroadTopic | undefined }) {
  const colors = useThemeColors();
  const { form, pending, update } = topic;

  return (
    <>
      <Field label="Broader topic">
        <View style={[styles.broad, { borderColor: colors.border, backgroundColor: colors.card }]}>
          <Text style={[styles.broadText, { color: colors.foreground }]}>{broad?.name ?? ""}</Text>
        </View>
      </Field>
      <TextField
        label="Focus (optional)"
        placeholder="e.g. Cell division, Recursion, Budgeting for beginners"
        value={form.focus}
        onChangeText={(text) => update("focus", text)}
        editable={!pending}
        maxLength={TOPIC_OF_THE_DAY_LIMITS.focus}
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
  broad: {
    borderWidth: 1,
    borderRadius: shape.lg,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  broadText: {
    ...typeScale.body,
  },
});

// src/features/motivation/components/ReflectTab.tsx
/** Reflection Journal: three open-ended journaling prompts and one perspective shift. */
import { ScrollView, StyleSheet, View } from "react-native";
import { NotebookPen, Lightbulb, NotebookText, Sparkles } from "lucide-react-native";
import { spacing } from "@/theme";
import { useAiSettings } from "@/features/ai-settings/providers/AiSettingsProvider";
import { ActionButton, ErrorText, Panel, TextField } from "@/components/tool/FormControls";
import { MarkdownText } from "@/components/tool/MarkdownText";
import { ResultCallout } from "@/components/tool/ResultCallout";
import { ListenButton } from "@/components/tool/ListenButton";
import { SectionTitle } from "@/components/tool/SectionTitle";
import { useRequest } from "@/hooks/useRequest";
import { generateReflection } from "../lib/generators";
import { REFLECTION_DEFAULTS, REFLECTION_DRAFT_KEY, restoreReflectionDraft } from "../lib/drafts";
import type { ReflectionFormValues, ReflectionResult } from "../lib/types";
import { useDraft } from "../hooks/useDraft";
import { EmptyHint } from "@/components/tool/EmptyHint";

export function useReflectTab() {
  const { settings } = useAiSettings();
  const draft = useDraft<ReflectionFormValues, ReflectionResult>(
    REFLECTION_DRAFT_KEY,
    REFLECTION_DEFAULTS,
    restoreReflectionDraft,
  );
  const request = useRequest(generateReflection);

  function update<K extends keyof ReflectionFormValues>(key: K, value: ReflectionFormValues[K]) {
    draft.setForm((prev) => ({ ...prev, [key]: value }));
  }

  function reset() {
    draft.reset();
    request.reset();
  }

  async function generate() {
    const generated = await request.run(settings, draft.form);
    if (generated) draft.setResult(generated);
  }

  return {
    form: draft.form,
    result: draft.result,
    pending: request.pending,
    error: request.error,
    update,
    generate,
    reset,
  };
}

export type ReflectTabState = ReturnType<typeof useReflectTab>;

export function ReflectForm({ state }: { state: ReflectTabState }) {
  const { form, pending, error, update, generate } = state;

  return (
    <View style={styles.form}>
      <ScrollView style={styles.fields} contentContainerStyle={styles.fieldsContent} keyboardShouldPersistTaps="handled">
        <TextField
          label="Current mood"
          placeholder="e.g. Anxious about work."
          value={form.currentMood}
          onChangeText={(text) => update("currentMood", text)}
          editable={!pending}
          maxLength={500}
          multiline
          voice
          style={styles.compactInput}
        />
        <TextField
          label="Goal or value to focus on"
          placeholder="e.g. Creative independence"
          value={form.goalAlignment}
          onChangeText={(text) => update("goalAlignment", text)}
          editable={!pending}
          maxLength={500}
        />
        <TextField
          label="Recent patterns (optional)"
          placeholder="Mood or progress trends from the past week…"
          value={form.recentPatterns}
          onChangeText={(text) => update("recentPatterns", text)}
          editable={!pending}
          maxLength={1000}
          multiline
          voice
          style={styles.compactInput}
        />
      </ScrollView>
      <ErrorText message={error} />
      <ActionButton
        label={pending ? "Reflecting…" : "Generate prompts"}
        icon={Sparkles}
        loading={pending}
        onPress={generate}
      />
    </View>
  );
}

export function ReflectResults({ state }: { state: ReflectTabState }) {
  const { result } = state;

  if (!result) {
    return (
      <EmptyHint
        icon={NotebookText}
        title="Your reflection prompts"
        hint="Describe your mood and a goal in the form below, then tap Generate prompts."
      />
    );
  }

  return (
    <>
      <Panel>
        <SectionTitle icon={NotebookPen} title="Journaling prompts" />
        <MarkdownText
          content={
            result.prompts.length > 0
              ? result.prompts.map((prompt, index) => `${index + 1}. ${prompt}`).join("\n")
              : "_No prompts returned._"
          }
        />
        <ListenButton text={result.prompts.join(" ")} label="Prompts" />
      </Panel>
      {result.perspectiveShift.trim() !== "" && (
        <ResultCallout icon={Lightbulb} title="Perspective shift" tone="sky">
          <MarkdownText content={result.perspectiveShift} />
          <ListenButton text={result.perspectiveShift} label="Perspective shift" />
        </ResultCallout>
      )}
    </>
  );
}

const styles = StyleSheet.create({
  form: {
    gap: spacing.md,
  },
  fields: {
    maxHeight: 320,
  },
  fieldsContent: {
    gap: spacing.md,
  },
  compactInput: {
    minHeight: 72,
  },
});

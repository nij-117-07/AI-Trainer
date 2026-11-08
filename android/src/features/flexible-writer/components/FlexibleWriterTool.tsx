// src/features/flexible-writer/components/FlexibleWriterTool.tsx
/** Flexible Writer form: a persona, the data to transform, and optional extra instructions. */
import { PenTool, RefreshCcw, Sparkles } from "lucide-react-native";
import { useAiSettings } from "@/features/ai-settings/providers/AiSettingsProvider";
import { ActionButton, ErrorText, Panel, TextField } from "@/components/tool/FormControls";
import { Section } from "@/components/tool/Section";
import { SectionTitle } from "@/components/tool/SectionTitle";
import { useRequest } from "@/hooks/useRequest";
import { usePersistedDraft } from "../hooks/usePersistedDraft";
import { FLEXIBLE_WRITER_STORAGE_KEY } from "../lib/persistence";
import { transformData } from "../lib/generators";
import { INPUT_DATA_MAX, INSTRUCTIONS_MAX, SYSTEM_PROMPT_MAX } from "../lib/validate";
import type { FlexibleWriterFormValues, FlexibleWriterResult } from "../types";
import { FlexibleWriterResultView } from "./FlexibleWriterResult";

const DEFAULTS: FlexibleWriterFormValues = {
  systemPrompt: "You are a strict AP-style copy editor. Rewrite text for clarity and concision.",
  inputData: "The reason why we was unable to complete the task was due to the fact that it was raining.",
  additionalUserInput: "Make it under 12 words.",
};

export function FlexibleWriterTool() {
  const { settings } = useAiSettings();
  const { form, setForm, result, setResult, reset } = usePersistedDraft<
    FlexibleWriterFormValues,
    FlexibleWriterResult
  >(FLEXIBLE_WRITER_STORAGE_KEY, DEFAULTS);
  const request = useRequest(transformData);

  function update<K extends keyof FlexibleWriterFormValues>(key: K, value: FlexibleWriterFormValues[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function handleReset() {
    reset();
    request.reset();
  }

  async function handleTransform() {
    const next = await request.run(settings, form);
    if (next) setResult(next);
  }

  return (
    <Section>
      <Panel>
        <TextField
          label="Persona / System Prompt"
          placeholder="You are a strict AP-style copy editor…"
          value={form.systemPrompt}
          onChangeText={(text) => update("systemPrompt", text)}
          editable={!request.pending}
          maxLength={SYSTEM_PROMPT_MAX}
          multiline
        />
        <TextField
          label="Input Data"
          placeholder="The text or content to transform…"
          value={form.inputData}
          onChangeText={(text) => update("inputData", text)}
          editable={!request.pending}
          maxLength={INPUT_DATA_MAX}
          multiline
        />
        <TextField
          label="Additional Instructions (optional)"
          placeholder="Specific instructions or context…"
          value={form.additionalUserInput}
          onChangeText={(text) => update("additionalUserInput", text)}
          editable={!request.pending}
          maxLength={INSTRUCTIONS_MAX}
          multiline
        />
        <ActionButton
          label={request.pending ? "Transforming…" : "Transform"}
          icon={Sparkles}
          loading={request.pending}
          onPress={handleTransform}
        />
      </Panel>

      <ErrorText message={request.error} />

      {result ? (
        <FlexibleWriterResultView result={result} />
      ) : (
        <SectionTitle icon={PenTool} title="No transformation yet" />
      )}

      <ActionButton label="Reset" icon={RefreshCcw} variant="outline" onPress={handleReset} />
    </Section>
  );
}

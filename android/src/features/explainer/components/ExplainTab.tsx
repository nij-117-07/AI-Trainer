// src/features/explainer/components/ExplainTab.tsx
/** Quick Explain: a structured explanation of a topic plus a one-line takeaway. */
import { useState } from "react";
import { Lightbulb, MessageSquareText, RefreshCcw, Sparkles } from "lucide-react-native";
import { useAiSettings } from "@/features/ai-settings/providers/AiSettingsProvider";
import { ActionButton, ErrorText, Panel, TextField } from "@/components/tool/FormControls";
import { SelectField } from "@/components/tool/SelectField";
import { Section } from "@/components/tool/Section";
import { useRequest } from "@/hooks/useRequest";
import { explainTopic } from "../lib/generators";
import { expertiseLevelOptions } from "../options";
import type { ExplainFormValues } from "../types";
import { MarkdownText } from "@/components/tool/MarkdownText";
import { ResultCallout } from "@/components/tool/ResultCallout";
import { ListenButton } from "@/components/tool/ListenButton";
import { SectionTitle } from "@/components/tool/SectionTitle";

const DEFAULTS: ExplainFormValues = {
  topic: "Quantum Entanglement",
  expertiseLevel: "beginner",
  context: "Use a metaphor involving shoes.",
};

export function ExplainTab() {
  const { settings } = useAiSettings();
  const [form, setForm] = useState<ExplainFormValues>(DEFAULTS);
  const request = useRequest(explainTopic);

  function update<K extends keyof ExplainFormValues>(key: K, value: ExplainFormValues[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function reset() {
    setForm(DEFAULTS);
    request.reset();
  }

  const result = request.data;

  return (
    <Section>
      <Panel>
        <TextField
          label="Topic"
          placeholder="e.g. Quantum Entanglement"
          value={form.topic}
          onChangeText={(text) => update("topic", text)}
          editable={!request.pending}
          maxLength={200}
        />
        <SelectField
          label="Expertise level"
          options={expertiseLevelOptions}
          value={form.expertiseLevel}
          onChange={(value) => update("expertiseLevel", value)}
          customPlaceholder="e.g. postgraduate"
        />
        <TextField
          label="Context (optional)"
          placeholder="Optional area of interest or constraints…"
          value={form.context}
          onChangeText={(text) => update("context", text)}
          editable={!request.pending}
          maxLength={2000}
          multiline
          voice
        />
        <ActionButton
          label={request.pending ? "Generating…" : "Generate explanation"}
          icon={Sparkles}
          loading={request.pending}
          onPress={() => request.run(settings, form)}
        />
      </Panel>

      <ErrorText message={request.error} />

      {result && (
        <>
          <ResultCallout icon={Lightbulb} title="Key takeaway" tone="emerald">
            <MarkdownText content={result.keyTakeaway} />
          </ResultCallout>
          <Panel>
            <SectionTitle icon={MessageSquareText} title="Explanation" />
            <MarkdownText content={result.explanation} />
            <ListenButton text={result.explanation} label="Explanation" />
          </Panel>
        </>
      )}

      <ActionButton label="Reset" icon={RefreshCcw} variant="outline" onPress={reset} />
    </Section>
  );
}

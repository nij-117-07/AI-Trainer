// src/features/explainer/components/FeynmanTab.tsx
/** Feynman: simplify a jargon-heavy idea with metaphors, pitched to an age the user picks. */
import { useState } from "react";
import { MessageCircleHeart, Puzzle, RefreshCcw, Sparkles } from "lucide-react-native";
import { useAiSettings } from "@/features/ai-settings/providers/AiSettingsProvider";
import { ActionButton, ErrorText, Panel, TextField } from "@/features/testing-portal/components/FormControls";
import { CountSlider } from "@/features/testing-portal/components/CountSlider";
import { Section } from "@/features/testing-portal/components/Section";
import { useRequest } from "@/features/testing-portal/hooks/useRequest";
import { simplifyTopic } from "../lib/generators";
import type { FeynmanFormValues } from "../types";
import { MarkdownText } from "./MarkdownText";
import { ResultCallout } from "./ResultCallout";
import { SectionTitle } from "./SectionTitle";
import { TagList } from "./TagList";

const DEFAULTS: FeynmanFormValues = {
  complexTopic: "Quantum Entanglement",
  targetAge: 5,
};

export function FeynmanTab() {
  const { settings } = useAiSettings();
  const [form, setForm] = useState<FeynmanFormValues>(DEFAULTS);
  const request = useRequest(simplifyTopic);

  function reset() {
    setForm(DEFAULTS);
    request.reset();
  }

  const result = request.data;

  return (
    <Section>
      <Panel>
        <TextField
          label="Complex topic"
          placeholder="e.g. Quantum Entanglement"
          value={form.complexTopic}
          onChangeText={(text) => setForm((prev) => ({ ...prev, complexTopic: text }))}
          editable={!request.pending}
          maxLength={200}
        />
        <CountSlider
          label="Target age (years)"
          min={3}
          max={25}
          value={form.targetAge}
          onChange={(value) => setForm((prev) => ({ ...prev, targetAge: value }))}
        />
        <ActionButton
          label={request.pending ? "Simplifying…" : "Simplify concept"}
          icon={Sparkles}
          loading={request.pending}
          onPress={() => request.run(settings, form)}
        />
      </Panel>

      <ErrorText message={request.error} />

      {result && (
        <>
          <Panel>
            <SectionTitle icon={Puzzle} title="Simplified explanation" />
            <MarkdownText content={result.explanation} />
          </Panel>

          {result.keyMetaphors.length > 0 && (
            <Panel>
              <SectionTitle icon={Sparkles} title="Key metaphors" />
              <TagList items={result.keyMetaphors} />
            </Panel>
          )}

          <ResultCallout icon={MessageCircleHeart} title="Fun analogy" tone="amber">
            <MarkdownText content={result.funAnalogy} />
          </ResultCallout>
        </>
      )}

      <ActionButton label="Reset" icon={RefreshCcw} variant="outline" onPress={reset} />
    </Section>
  );
}

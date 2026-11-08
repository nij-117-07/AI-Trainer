// src/features/explainer/components/AtozTab.tsx
/** A-to-Z Tutorial: one cohesive markdown document that covers a topic from basics to mastery. */
import { useState } from "react";
import { BookOpenText, RefreshCcw, Sparkles } from "lucide-react-native";
import { useAiSettings } from "@/features/ai-settings/providers/AiSettingsProvider";
import { ActionButton, ErrorText, Panel, TextField } from "@/components/tool/FormControls";
import { SelectField } from "@/components/tool/SelectField";
import { Section } from "@/components/tool/Section";
import { useRequest } from "@/hooks/useRequest";
import { generateTutorial } from "../lib/generators";
import { explanationStyleOptions, expertiseLevelOptions } from "../options";
import type { TutorialFormValues } from "../types";
import { MarkdownText } from "@/components/tool/MarkdownText";
import { SectionTitle } from "@/components/tool/SectionTitle";

const DEFAULTS: TutorialFormValues = {
  topic: "FastAPI Architecture",
  expertiseLevel: "intermediate",
  explanationStyle: "practical",
};

export function AtozTab() {
  const { settings } = useAiSettings();
  const [form, setForm] = useState<TutorialFormValues>(DEFAULTS);
  const request = useRequest(generateTutorial);

  function update<K extends keyof TutorialFormValues>(key: K, value: TutorialFormValues[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function reset() {
    setForm(DEFAULTS);
    request.reset();
  }

  return (
    <Section>
      <Panel>
        <TextField
          label="Topic"
          placeholder="e.g. FastAPI Architecture"
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
        <SelectField
          label="Explanation style"
          options={explanationStyleOptions}
          value={form.explanationStyle}
          onChange={(value) => update("explanationStyle", value)}
          customPlaceholder="e.g. history-first"
        />
        <ActionButton
          label={request.pending ? "Writing…" : "Generate tutorial"}
          icon={Sparkles}
          loading={request.pending}
          onPress={() => request.run(settings, form)}
        />
      </Panel>

      <ErrorText message={request.error} />

      {request.data && (
        <Panel>
          <SectionTitle icon={BookOpenText} title="Full A-to-Z tutorial" />
          <MarkdownText content={request.data.fullExplanation} />
        </Panel>
      )}

      <ActionButton label="Reset" icon={RefreshCcw} variant="outline" onPress={reset} />
    </Section>
  );
}

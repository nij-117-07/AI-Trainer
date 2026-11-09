// src/features/testing-portal/components/GraderTab.tsx
/**
 * Performance Grader. Describe the task and the objective, then grade a written answer, an
 * image, or both. The settings form collapses once a grade is shown. "Reset" clears it all.
 */
import { useState } from "react";
import { RefreshCcw, ShieldCheck } from "lucide-react-native";
import { useAiSettings } from "@/features/ai-settings/providers/AiSettingsProvider";
import { useRequest } from "@/hooks/useRequest";
import { gradeAnswer } from "../lib/generators";
import { expectedLevelOptions } from "../options";
import type { ImageInput } from "../types";
import { ActionButton, ErrorText, Panel, TextField } from "@/components/tool/FormControls";
import { GraderFeedback } from "./GraderFeedback";
import { ImagePickerField } from "@/components/tool/ImagePickerField";
import { SelectField } from "@/components/tool/SelectField";
import { Section } from "@/components/tool/Section";
import { SettingsToggle } from "@/components/tool/SettingsToggle";

const DEFAULTS = {
  scenario: "Handle a difficult customer complaint",
  questionAsked: "How would you de-escalate this situation?",
  targetObjective: "Calm the customer and offer a resolution",
  expectedLevel: "intermediate",
  userAnswerText: "I would listen actively and offer a refund.",
};

export function GraderTab() {
  const { settings } = useAiSettings();
  const [form, setForm] = useState(DEFAULTS);
  const [image, setImage] = useState<ImageInput | null>(null);
  const [showForm, setShowForm] = useState(true);
  const grade = useRequest(gradeAnswer);

  function update<K extends keyof typeof DEFAULTS>(key: K, value: string) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleGrade() {
    const result = await grade.run(settings, { ...form, image });
    if (result) setShowForm(false);
  }

  function reset() {
    setForm(DEFAULTS);
    setImage(null);
    grade.reset();
    setShowForm(true);
  }

  const summary = form.scenario.trim() || "No task yet";

  return (
    <Section>
      <SettingsToggle
        title="Task and answer"
        summary={summary}
        expanded={showForm}
        onToggle={() => setShowForm((value) => !value)}
      />

      {showForm && (
        <Panel>
          <TextField
            label="Scenario"
            placeholder="e.g. Handle a difficult customer complaint"
            value={form.scenario}
            onChangeText={(text) => update("scenario", text)}
            maxLength={500}
            voice
          />
          <TextField
            label="Question asked"
            placeholder="The exact question the user is answering."
            value={form.questionAsked}
            onChangeText={(text) => update("questionAsked", text)}
            maxLength={2000}
            multiline
            voice
          />
          <TextField
            label="Target objective"
            placeholder="e.g. Calm the customer and offer a resolution"
            value={form.targetObjective}
            onChangeText={(text) => update("targetObjective", text)}
            maxLength={1000}
            voice
          />
          <SelectField
            label="Expected level"
            options={expectedLevelOptions}
            value={form.expectedLevel}
            onChange={(value) => update("expectedLevel", value)}
            customPlaceholder="Type your own level, e.g. master-level"
          />
          <TextField
            label="Your answer (optional if you attach an image)"
            placeholder="Paste your written answer here."
            value={form.userAnswerText}
            onChangeText={(text) => update("userAnswerText", text)}
            maxLength={5000}
            multiline
            voice
          />
          <ImagePickerField value={image} onChange={setImage} disabled={grade.pending} />
          <ActionButton
            label={grade.pending ? "Grading…" : "Grade my answer"}
            icon={ShieldCheck}
            loading={grade.pending}
            onPress={handleGrade}
          />
        </Panel>
      )}

      <ErrorText message={grade.error} />

      {grade.data && (
        <>
          <Panel>
            <GraderFeedback result={grade.data} />
          </Panel>
          <ActionButton label="Reset" icon={RefreshCcw} variant="outline" onPress={reset} />
        </>
      )}
    </Section>
  );
}

// src/features/clarity-trainer/components/ClarityTrainerTool.tsx
/**
 * Clarity Trainer: pick a scenario type, answer it in your own words, then review the analysis,
 * coach feedback, a tighter rewrite, and the gold-standard reply. The scenario, reply, and review
 * stay on the device until Reset or "Try another scenario".
 */
import { useState } from "react";
import { StyleSheet, Text } from "react-native";
import { RefreshCcw, Sparkles } from "lucide-react-native";
import { useThemeColors } from "@/theme";
import { useAiSettings } from "@/features/ai-settings/providers/AiSettingsProvider";
import { ActionButton, ErrorText, Panel, TextField } from "@/components/tool/FormControls";
import { SelectField } from "@/components/tool/SelectField";
import { Section } from "@/components/tool/Section";
import { CATEGORY_OPTIONS, DIFFICULTY_OPTIONS, LIMITS } from "../options";
import { CLARITY_STORAGE_KEYS, FORM_DEFAULTS, restoreForm, restoreRound } from "../lib/persistence";
import { generateScenario, evaluateResponse } from "../lib/generators";
import { requireText } from "../lib/validate";
import type { ClarityRound, ScenarioFormValues } from "../types";
import { useAbortableTask } from "../hooks/useAbortableTask";
import { useStoredDocument } from "../hooks/useStoredDocument";
import { EvaluationPanels } from "./EvaluationPanels";
import { ScenarioPanel } from "./ScenarioPanel";

function messageOf(err: unknown): string {
  return err instanceof Error ? err.message : "Something went wrong. Please try again.";
}

export function ClarityTrainerTool() {
  const colors = useThemeColors();
  const { settings } = useAiSettings();
  const form = useStoredDocument<ScenarioFormValues>(CLARITY_STORAGE_KEYS.form, FORM_DEFAULTS, restoreForm);
  const round = useStoredDocument<ClarityRound | null>(CLARITY_STORAGE_KEYS.round, null, restoreRound);
  const generate = useAbortableTask(generateScenario);
  const evaluate = useAbortableTask(evaluateResponse);
  const [localError, setLocalError] = useState<string | null>(null);

  const busy = generate.pending || evaluate.pending;
  const current = round.value;
  const evaluated = current?.evaluation != null;

  function updateForm<K extends keyof ScenarioFormValues>(key: K, value: ScenarioFormValues[K]) {
    form.setValue((prev) => ({ ...prev, [key]: value }));
  }

  function updateResponse(text: string) {
    round.setValue((prev) => (prev ? { ...prev, response: text } : prev));
  }

  async function handleGenerate() {
    setLocalError(null);
    const scenario = await generate.run(settings, form.value);
    if (scenario) round.setValue({ scenario, response: "", evaluation: null });
  }

  async function handleEvaluate() {
    if (!current) return;
    let response: string;
    try {
      response = requireText(current.response, "Your response", LIMITS.response);
    } catch (err) {
      setLocalError(messageOf(err));
      return;
    }
    setLocalError(null);
    const evaluation = await evaluate.run(settings, current.scenario, response);
    if (evaluation) round.setValue((prev) => (prev ? { ...prev, response, evaluation } : prev));
  }

  function handleReset() {
    generate.cancel();
    evaluate.cancel();
    setLocalError(null);
    round.setValue(null);
    form.setValue(FORM_DEFAULTS);
  }

  return (
    <Section>
      <Panel>
        <SelectField
          label="Difficulty"
          options={DIFFICULTY_OPTIONS}
          value={form.value.difficulty}
          onChange={(value) => updateForm("difficulty", value)}
          allowCustom={false}
        />
        <SelectField
          label="Scenario category"
          options={CATEGORY_OPTIONS}
          value={form.value.category}
          onChange={(value) => updateForm("category", value)}
          allowCustom={false}
        />
        <TextField
          label="Your context (optional)"
          placeholder="e.g. Software engineer, manager"
          value={form.value.userContext}
          onChangeText={(text) => updateForm("userContext", text)}
          editable={!busy}
          maxLength={LIMITS.userContext}
        />
        <ActionButton
          label={generate.pending ? "Creating scenario…" : "Generate scenario"}
          icon={Sparkles}
          loading={generate.pending}
          onPress={handleGenerate}
        />
        <ErrorText message={generate.error} />
      </Panel>

      {current ? (
        <>
          <ScenarioPanel
            round={current}
            pending={evaluate.pending}
            error={localError ?? evaluate.error}
            onResponseChange={updateResponse}
            onEvaluate={handleEvaluate}
          />
          {current.evaluation && <EvaluationPanels evaluation={current.evaluation} />}
        </>
      ) : (
        <Text style={[styles.empty, { color: colors.mutedForeground }]}>
          Pick a difficulty and category, then generate a communication scenario to respond to.
        </Text>
      )}

      {current && (
        <ActionButton
          label={evaluated ? "Try another scenario" : "Reset"}
          icon={RefreshCcw}
          variant="outline"
          onPress={handleReset}
        />
      )}
    </Section>
  );
}

const styles = StyleSheet.create({
  empty: {
    fontSize: 14,
    lineHeight: 20,
  },
});

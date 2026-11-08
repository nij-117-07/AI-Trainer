// src/features/riddle/components/RiddleTab.tsx
/**
 * Riddle Generator: pick a topic, cognitive domain, and difficulty, then guess the riddle until
 * it is solved. The form draft and the active round are kept on the device between visits.
 */
import { useEffect, useRef, useState } from "react";
import { StyleSheet, Text } from "react-native";
import { Sparkles, RefreshCcw } from "lucide-react-native";
import { spacing, useThemeColors } from "@/theme";
import { useAiSettings } from "@/features/ai-settings/providers/AiSettingsProvider";
import { ActionButton, ErrorText, Panel, TextField } from "@/components/tool/FormControls";
import { SelectField } from "@/components/tool/SelectField";
import { Section } from "@/components/tool/Section";
import { useRequest } from "@/hooks/useRequest";
import { COGNITIVE_DOMAIN_OPTIONS, DEFAULT_FORM, DIFFICULTY_OPTIONS } from "../options";
import { evaluateRiddleAnswer, generateRiddle } from "../lib/generators";
import { sanitizeForm, sanitizeRound } from "../lib/normalize";
import { usePersistedDocument } from "../hooks/usePersistedDocument";
import type { RiddleFormValues, RiddleRound } from "../types";
import { RiddleRoundView } from "./RiddleRoundView";

export const RIDDLE_STORAGE_KEYS = {
  form: "practice.riddle.form.v1",
  round: "practice.riddle.round.v1",
} as const;

export function RiddleTab() {
  const colors = useThemeColors();
  const { settings } = useAiSettings();
  const form = usePersistedDocument<RiddleFormValues>(RIDDLE_STORAGE_KEYS.form, DEFAULT_FORM, sanitizeForm);
  const round = usePersistedDocument<RiddleRound | null>(RIDDLE_STORAGE_KEYS.round, null, sanitizeRound);
  const [showSolution, setShowSolution] = useState(false);
  const generate = useRequest(generateRiddle);
  const evaluate = useRequest(evaluateRiddleAnswer);
  const activeRequest = useRef<AbortController | null>(null);

  useEffect(() => () => activeRequest.current?.abort(), []);

  function startRequest(): AbortSignal {
    const controller = new AbortController();
    activeRequest.current = controller;
    return controller.signal;
  }

  function updateForm<K extends keyof RiddleFormValues>(key: K, value: RiddleFormValues[K]) {
    form.setValue((prev) => ({ ...prev, [key]: value }));
  }

  async function handleGenerate() {
    const signal = startRequest();
    const riddle = await generate.run(settings, form.value, signal);
    if (!riddle || signal.aborted) return;
    setShowSolution(false);
    round.setValue({ riddle, attempts: [], userAnswer: "" });
  }

  async function handleSubmitAnswer() {
    const current = round.value;
    if (!current) return;
    const answer = current.userAnswer.trim();
    if (!answer) return;
    round.setValue({ ...current, userAnswer: answer });
    const signal = startRequest();
    const evaluation = await evaluate.run(settings, current.riddle, answer, signal);
    if (!evaluation || signal.aborted) return;
    round.setValue((latest) =>
      latest && latest.riddle === current.riddle
        ? { ...latest, attempts: [...latest.attempts, { answer, evaluation }], userAnswer: "" }
        : latest,
    );
  }

  function handleAnswerChange(text: string) {
    round.setValue((latest) => (latest ? { ...latest, userAnswer: text } : latest));
  }

  function handleReset() {
    form.setValue(DEFAULT_FORM);
    round.setValue(null);
    setShowSolution(false);
    generate.reset();
    evaluate.reset();
  }

  const busy = generate.pending || evaluate.pending;

  return (
    <Section>
      <Panel>
        <TextField
          label="Topic"
          placeholder="e.g. Space, Ancient Architecture"
          value={form.value.fieldOfInterest}
          onChangeText={(text) => updateForm("fieldOfInterest", text)}
          editable={!generate.pending}
          maxLength={200}
        />
        <SelectField
          label="Cognitive Domain"
          options={COGNITIVE_DOMAIN_OPTIONS}
          value={form.value.targetDomain}
          onChange={(value) => updateForm("targetDomain", value)}
          allowCustom={false}
        />
        <SelectField
          label="Difficulty"
          options={DIFFICULTY_OPTIONS}
          value={form.value.difficultyLevel}
          onChange={(value) => updateForm("difficultyLevel", value)}
          allowCustom={false}
        />
        <ActionButton
          label={generate.pending ? "Crafting the riddle…" : "Generate riddle"}
          icon={Sparkles}
          loading={generate.pending}
          onPress={handleGenerate}
        />
      </Panel>

      <ErrorText message={generate.error} />

      {round.value ? (
        <RiddleRoundView
          round={round.value}
          pending={evaluate.pending}
          error={evaluate.error}
          showSolution={showSolution}
          onToggleSolution={() => setShowSolution((value) => !value)}
          onAnswerChange={handleAnswerChange}
          onSubmit={handleSubmitAnswer}
        />
      ) : (
        <Text style={[styles.empty, { color: colors.mutedForeground }]}>
          No riddle yet. Pick a topic and difficulty, then generate your first riddle.
        </Text>
      )}

      <ActionButton label="Reset" icon={RefreshCcw} variant="outline" loading={busy} onPress={handleReset} />
    </Section>
  );
}

const styles = StyleSheet.create({
  empty: {
    fontSize: 14,
    lineHeight: 20,
    paddingHorizontal: spacing.xs,
  },
});

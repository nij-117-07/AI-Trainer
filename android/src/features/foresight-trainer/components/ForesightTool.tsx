// src/features/foresight-trainer/components/ForesightTool.tsx
/**
 * Foresight Trainer: the scenario form, then the running multi-scene decision flow. The session and
 * the form draft are kept on the device, and every AI call can be cancelled by Reset or leaving.
 */
import { useEffect, useRef } from "react";
import { Compass, RefreshCcw, Sparkles } from "lucide-react-native";
import { useAiSettings } from "@/features/ai-settings/providers/AiSettingsProvider";
import { ActionButton, ErrorText, Panel, TextField } from "@/components/tool/FormControls";
import { CountSlider } from "@/components/tool/CountSlider";
import { SelectField } from "@/components/tool/SelectField";
import { Section } from "@/components/tool/Section";
import { SectionTitle } from "@/components/tool/SectionTitle";
import { useRequest } from "@/hooks/useRequest";
import { DIFFICULTY_OPTIONS } from "../options";
import { processDecision, startScenario } from "../lib/generators";
import { applyDecision, createSession } from "../lib/session";
import { FORESIGHT_STORAGE_KEYS, restoreForm, restoreSession } from "../lib/persistence";
import { usePersistedDocument } from "../hooks/usePersistedDocument";
import type { ForesightSession, StartFormValues } from "../types";
import { ForesightBoard } from "./ForesightBoard";

const DEFAULTS: StartFormValues = {
  userContext: "You lead a small team building a payments startup in a crowded market.",
  mainTheme: "strategic negotiation",
  difficulty: "intermediate",
  maxScenes: 5,
};

const restoreFormDraft = (saved: unknown) => restoreForm(DEFAULTS, saved);

export function ForesightTool() {
  const { settings } = useAiSettings();
  const form = usePersistedDocument<StartFormValues>(FORESIGHT_STORAGE_KEYS.form, DEFAULTS, restoreFormDraft);
  const session = usePersistedDocument<ForesightSession | null>(FORESIGHT_STORAGE_KEYS.session, null, restoreSession);
  const start = useRequest(startScenario);
  const decide = useRequest(processDecision);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => () => abortRef.current?.abort(), []);

  function beginRequest(): AbortSignal {
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;
    return controller.signal;
  }

  function update<K extends keyof StartFormValues>(key: K, value: StartFormValues[K]) {
    form.setValue((prev) => ({ ...prev, [key]: value }));
  }

  function handleReset() {
    abortRef.current?.abort();
    start.reset();
    decide.reset();
    session.setValue(null);
    form.setValue(DEFAULTS);
  }

  async function handleStart() {
    const signal = beginRequest();
    const result = await start.run(settings, form.value, signal);
    if (signal.aborted) {
      start.reset();
      return;
    }
    if (!result) return;
    session.setValue(createSession(form.value.mainTheme, result));
  }

  async function handleDecide(choice: string, reasoning: string): Promise<boolean> {
    const current = session.value;
    if (!current) return false;
    const signal = beginRequest();
    const outcome = await decide.run(settings, { session: current, choice, reasoning }, signal);
    if (signal.aborted) {
      decide.reset();
      return false;
    }
    if (!outcome) return false;
    session.setValue((prev) => (prev ? applyDecision(prev, outcome) : prev));
    return true;
  }

  const current = session.value;

  return (
    <Section>
      <Panel>
        <TextField
          label="Your context"
          placeholder="Describe your situation, role, resources, and constraints."
          value={form.value.userContext}
          onChangeText={(text) => update("userContext", text)}
          editable={!start.pending}
          maxLength={3000}
          multiline
        />
        <TextField
          label="Theme / skill to train"
          placeholder="e.g. strategic negotiation, crisis leadership"
          value={form.value.mainTheme}
          onChangeText={(text) => update("mainTheme", text)}
          editable={!start.pending}
          maxLength={300}
        />
        <SelectField
          label="Difficulty"
          options={DIFFICULTY_OPTIONS}
          value={form.value.difficulty}
          onChange={(value) => update("difficulty", value)}
          allowCustom={false}
        />
        <CountSlider
          label="Max scenes"
          min={1}
          max={20}
          value={form.value.maxScenes}
          onChange={(value) => update("maxScenes", value)}
        />
        <ActionButton
          label={start.pending ? "Writing the opening scene…" : current ? "Start a new scenario" : "Start scenario"}
          icon={Sparkles}
          loading={start.pending}
          onPress={handleStart}
        />
        <ErrorText message={start.error} />
      </Panel>

      {current ? (
        <ForesightBoard
          key={current.sceneNumber}
          session={current}
          pending={decide.pending}
          error={decide.error}
          onDecide={handleDecide}
        />
      ) : (
        <Panel>
          <SectionTitle icon={Compass} title="No scenario yet" />
        </Panel>
      )}

      <ActionButton label="Reset" icon={RefreshCcw} variant="outline" onPress={handleReset} />
    </Section>
  );
}

// src/features/simulator/components/SimulatorRunTab.tsx
/**
 * Simulator Run: a persona, a scenario, and the line delivered to them. The simulator returns the
 * persona's inner thought, chosen action, spoken reply, and mood. The form and result are kept on the device.
 */
import { useEffect, useRef, useState } from "react";
import { StyleSheet, Text } from "react-native";
import { RefreshCcw, Sparkles } from "lucide-react-native";
import { spacing, useThemeColors } from "@/theme";
import { useAiSettings } from "@/features/ai-settings/providers/AiSettingsProvider";
import { ActionButton, ErrorText, Panel, TextField } from "@/components/tool/FormControls";
import { Section } from "@/components/tool/Section";
import { usePersistedDocument } from "../hooks/usePersistedDocument";
import { runSimulation } from "../lib/generators";
import { RUN_DEFAULTS } from "../lib/defaults";
import { normaliseRunState } from "../lib/state";
import { SIMULATOR_STORAGE_KEYS } from "../lib/storage";
import type { SimulationFormValues } from "../types";
import { SimulationResultView } from "./SimulationResultView";
import { SimulatorNav } from "./SimulatorNav";

export function SimulatorRunTab() {
  const colors = useThemeColors();
  const { settings } = useAiSettings();
  const { value: state, setValue: setState } = usePersistedDocument(SIMULATOR_STORAGE_KEYS.run, normaliseRunState);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const runController = useRef<AbortController | null>(null);

  useEffect(() => () => runController.current?.abort(), []);

  function update<K extends keyof SimulationFormValues>(key: K, value: SimulationFormValues[K]) {
    setState((current) => ({ ...current, form: { ...current.form, [key]: value } }));
  }

  function handleReset() {
    runController.current?.abort();
    setPending(false);
    setError(null);
    setState({ form: RUN_DEFAULTS, result: null });
  }

  async function handleRun() {
    if (pending) return;
    const controller = new AbortController();
    runController.current = controller;
    setPending(true);
    setError(null);
    try {
      const next = await runSimulation(settings, state.form, controller.signal);
      if (!controller.signal.aborted) setState((current) => ({ ...current, result: next }));
    } catch (err) {
      if (!controller.signal.aborted) {
        setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
      }
    } finally {
      if (runController.current === controller) setPending(false);
    }
  }

  return (
    <Section>
      <SimulatorNav current="run" />

      <Panel>
        <TextField
          label="Persona"
          placeholder="e.g. A pragmatic retired starship captain."
          hint="The character the simulator will embody."
          value={state.form.persona}
          onChangeText={(text) => update("persona", text)}
          editable={!pending}
          maxLength={1000}
          voice
        />
        <TextField
          label="Scenario"
          placeholder="e.g. Oxygen levels at 15%. Distress signal detected."
          hint="The setting or situation the persona is in."
          value={state.form.scenario}
          onChangeText={(text) => update("scenario", text)}
          editable={!pending}
          maxLength={2000}
          multiline
          voice
        />
        <TextField
          label="Your Line"
          placeholder="e.g. Captain, we must help them!"
          hint="The dialogue you address to the persona."
          value={state.form.userInput}
          onChangeText={(text) => update("userInput", text)}
          editable={!pending}
          maxLength={2000}
          multiline
          voice
        />
        <TextField
          label="Additional Context"
          placeholder="Optional — background, history, or environmental factors…"
          hint="Optional. Extra info to shape the simulation."
          value={state.form.additionalContext}
          onChangeText={(text) => update("additionalContext", text)}
          editable={!pending}
          maxLength={2000}
          multiline
          voice
        />
        <ActionButton
          label={pending ? "Running the scenario…" : "Run simulation"}
          icon={Sparkles}
          loading={pending}
          onPress={handleRun}
        />
      </Panel>

      <ErrorText message={error} />

      {state.result ? (
        <SimulationResultView result={state.result} />
      ) : (
        <Text style={[styles.empty, { color: colors.mutedForeground }]}>
          Set a persona and scenario, then deliver your line to see how they respond.
        </Text>
      )}

      <ActionButton label="Reset" icon={RefreshCcw} variant="outline" onPress={handleReset} />
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

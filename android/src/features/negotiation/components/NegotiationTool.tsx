// src/features/negotiation/components/NegotiationTool.tsx
/**
 * Negotiation Practice body: set up a scenario, trade turns with the AI opponent, then end the
 * session for a performance report. The session is saved on the device and survives a restart.
 */
import { useEffect, useRef } from "react";
import { StyleSheet, Text } from "react-native";
import { Handshake, RefreshCcw } from "lucide-react-native";
import { useThemeColors } from "@/theme";
import { useAiSettings } from "@/features/ai-settings/providers/AiSettingsProvider";
import { ActionButton, ErrorText, Panel, TextField } from "@/components/tool/FormControls";
import { SelectField } from "@/components/tool/SelectField";
import { Section } from "@/components/tool/Section";
import { useRequest } from "@/hooks/useRequest";
import { DIFFICULTY_OPTIONS } from "../options";
import { evaluateNegotiation, startScenario, takeTurn } from "../lib/generators";
import { historyOf } from "../lib/normalize";
import { asSession, mergeSavedForm, NEGOTIATION_FORM_KEY, NEGOTIATION_SESSION_KEY } from "../lib/persistence";
import { usePersistedValue } from "../hooks/usePersistedValue";
import type { MessageAnalysis, NegotiationSession, ScenarioFormValues, SessionEntry } from "../types";
import { NegotiationBoard } from "./NegotiationBoard";

const DEFAULTS: ScenarioFormValues = {
  difficulty: "intermediate",
  domain: "salary",
};

export function NegotiationTool() {
  const { settings } = useAiSettings();
  const [form, setForm] = usePersistedValue<ScenarioFormValues>(NEGOTIATION_FORM_KEY, DEFAULTS, (saved) =>
    mergeSavedForm(DEFAULTS, saved),
  );
  const [session, setSession] = usePersistedValue<NegotiationSession | null>(NEGOTIATION_SESSION_KEY, null, asSession);
  const start = useRequest(startScenario);
  const turn = useRequest(takeTurn);
  const evaluate = useRequest(evaluateNegotiation);
  const controllerRef = useRef<AbortController | null>(null);

  useEffect(() => () => controllerRef.current?.abort(), []);

  const busy = start.pending || turn.pending || evaluate.pending;

  function nextController(): AbortController {
    controllerRef.current?.abort();
    const controller = new AbortController();
    controllerRef.current = controller;
    return controller;
  }

  async function handleStart() {
    const controller = nextController();
    const scenario = await start.run(settings, form, controller.signal);
    if (!scenario || controller.signal.aborted) return;
    setSession({
      id: Date.now().toString(36),
      scenario,
      log: [{ role: "opponent", text: scenario.startingStanceOpponent }],
      complete: false,
      finalOutcome: "",
      report: null,
    });
  }

  async function handleSend(message: string): Promise<boolean> {
    if (!session) return false;
    const controller = nextController();
    const result = await turn.run(
      settings,
      { scenario: session.scenario, history: historyOf(session.log), userMessage: message },
      controller.signal,
    );
    if (!result || controller.signal.aborted) return false;
    setSession((prev) =>
      prev ? { ...prev, log: [...prev.log, ...turnEntries(message, result.opponentReply, result.analysis)] } : prev,
    );
    return true;
  }

  async function handleEvaluate(outcome: string): Promise<boolean> {
    if (!session) return false;
    const controller = nextController();
    const report = await evaluate.run(
      settings,
      { scenario: session.scenario, history: historyOf(session.log), outcome },
      controller.signal,
    );
    if (!report || controller.signal.aborted) return false;
    setSession((prev) => (prev ? { ...prev, complete: true, finalOutcome: outcome, report } : prev));
    return true;
  }

  function handleReset() {
    controllerRef.current?.abort();
    setForm(DEFAULTS);
    setSession(null);
    start.reset();
    turn.reset();
    evaluate.reset();
  }

  return (
    <Section>
      <Panel>
        <SelectField
          label="Difficulty"
          options={DIFFICULTY_OPTIONS}
          value={form.difficulty}
          onChange={(value) => setForm((prev) => ({ ...prev, difficulty: value }))}
          allowCustom={false}
        />
        <TextField
          label="Domain"
          placeholder="e.g. salary, real estate, business deal, diplomatic"
          value={form.domain}
          onChangeText={(text) => setForm((prev) => ({ ...prev, domain: text }))}
          editable={!start.pending}
          maxLength={200}
        />
        <ActionButton
          label={start.pending ? "Setting the scene…" : session ? "Start a new negotiation" : "Start negotiation"}
          icon={Handshake}
          loading={start.pending}
          onPress={handleStart}
        />
      </Panel>

      <ErrorText message={start.error} />

      {session ? (
        <NegotiationBoard
          key={session.id}
          session={session}
          busy={busy}
          error={turn.error ?? evaluate.error}
          onSend={handleSend}
          onEvaluate={handleEvaluate}
        />
      ) : (
        <EmptyNote message="Pick a domain and difficulty, then face the opponent." />
      )}

      <ActionButton label="Reset" icon={RefreshCcw} variant="outline" onPress={handleReset} />
    </Section>
  );
}

function EmptyNote({ message }: { message: string }) {
  const colors = useThemeColors();
  return <Text style={[styles.empty, { color: colors.mutedForeground }]}>{message}</Text>;
}

const styles = StyleSheet.create({
  empty: {
    fontSize: 14,
    lineHeight: 20,
  },
});

/** The chat lines a finished turn adds: the trainee's message, the reply, and a coach tip. */
function turnEntries(message: string, reply: string, analysis: MessageAnalysis): SessionEntry[] {
  const entries: SessionEntry[] = [
    { role: "user", text: message },
    { role: "opponent", text: reply },
  ];
  const tips = [analysis.feedbackSnippet];
  if (analysis.tacticsUsed.length > 0) tips.push(`Tactics detected: ${analysis.tacticsUsed.join(", ")}`);
  const tipText = tips.filter(Boolean).join("\n\n");
  if (tipText) entries.push({ role: "coach", text: tipText });
  return entries;
}

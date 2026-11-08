// src/features/executive-eq/components/ExecutiveEqTool.tsx
/**
 * Executive EQ Trainer: the scenario form, then the running simulation. The session and the form
 * draft are kept on the device, and every AI call can be cancelled by Reset or leaving the screen.
 */
import { useEffect, useRef } from "react";
import { StyleSheet, Text } from "react-native";
import { Briefcase, RefreshCcw, Sparkles } from "lucide-react-native";
import { useThemeColors } from "@/theme";
import { useAiSettings } from "@/features/ai-settings/providers/AiSettingsProvider";
import { ActionButton, ErrorText, Panel, TextField } from "@/components/tool/FormControls";
import { SelectField } from "@/components/tool/SelectField";
import { Section } from "@/components/tool/Section";
import { SectionTitle } from "@/components/tool/SectionTitle";
import { useRequest } from "@/hooks/useRequest";
import { DIFFICULTY_OPTIONS, LEARNING_FOCUS_OPTIONS } from "../options";
import { respondToMove, startSimulation } from "../lib/generators";
import { restoreForm, restoreSession, EQ_STORAGE_KEYS } from "../lib/persistence";
import { usePersistedDocument } from "../hooks/usePersistedDocument";
import type { ExecutiveEqSession, ScenarioFormValues, ScenarioResult } from "../types";
import { SimulationBoard } from "./SimulationBoard";

const DEFAULTS: ScenarioFormValues = {
  userRole: "Chief Technology Officer",
  narrativeArc: "Delay a product launch without admitting the code is buggy",
  learningFocus: "strategic_ambiguity",
  difficultyLevel: "Ruthless Board",
  industryContext: "FinTech",
};

const restoreFormDraft = (saved: unknown) => restoreForm(DEFAULTS, saved);

export function ExecutiveEqTool() {
  const colors = useThemeColors();
  const { settings } = useAiSettings();
  const form = usePersistedDocument<ScenarioFormValues>(EQ_STORAGE_KEYS.form, DEFAULTS, restoreFormDraft);
  const session = usePersistedDocument<ExecutiveEqSession | null>(EQ_STORAGE_KEYS.session, null, restoreSession);
  const start = useRequest(startSimulation);
  const respond = useRequest(respondToMove);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => () => abortRef.current?.abort(), []);

  function beginRequest(): AbortSignal {
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;
    return controller.signal;
  }

  function update<K extends keyof ScenarioFormValues>(key: K, value: ScenarioFormValues[K]) {
    form.setValue((prev) => ({ ...prev, [key]: value }));
  }

  function handleReset() {
    abortRef.current?.abort();
    start.reset();
    respond.reset();
    session.setValue(null);
    form.setValue(DEFAULTS);
  }

  async function handleStart() {
    const signal = beginRequest();
    const scenario: ScenarioResult | null = await start.run(settings, form.value, signal);
    if (signal.aborted) {
      start.reset();
      return;
    }
    if (!scenario) return;
    session.setValue({
      scenario,
      learningFocus: form.value.learningFocus,
      narrativeArc: form.value.narrativeArc,
      chatHistory: [{ role: "npc", content: scenario.openingHook }],
      log: [{ role: "assistant", content: scenario.openingHook }],
      grades: [],
      lastBriefing: null,
      scenarioContext: scenario.settingDescription,
      npcLastStatement: scenario.openingHook,
    });
  }

  async function handleRespond(response: string): Promise<boolean> {
    const current = session.value;
    if (!current) return false;
    const signal = beginRequest();
    const result = await respond.run(settings, { session: current, response }, signal);
    if (signal.aborted) {
      respond.reset();
      return false;
    }
    if (!result) return false;
    const { evaluation, nextMove } = result;
    session.setValue((prev) =>
      prev
        ? {
            ...prev,
            chatHistory: [
              ...prev.chatHistory,
              { role: "user", content: response },
              { role: "npc", content: nextMove.npcDialogue },
            ],
            log: [
              ...prev.log,
              { role: "user", content: response },
              {
                role: "assistant",
                content: `**Coach's evaluation**\n\nSubtext: ${evaluation.subtextAccuracy}\nStatus: ${evaluation.statusImpact} · Strategic grade: **${evaluation.strategicGrade}**\n\n**Rewritten pro move:** ${evaluation.theRewrittenProMove}\n\n**Tip:** ${evaluation.coachingTip}`,
              },
              { role: "assistant", content: nextMove.npcDialogue },
            ],
            grades: [...prev.grades, evaluation],
            lastBriefing: nextMove,
            scenarioContext: nextMove.meetingScenario,
            npcLastStatement: nextMove.npcDialogue,
          }
        : prev,
    );
    return true;
  }

  const pending = start.pending || respond.pending;

  return (
    <Section>
      <Panel>
        <TextField
          label="Your role"
          placeholder="e.g. VP of Sales, CEO"
          value={form.value.userRole}
          onChangeText={(text) => update("userRole", text)}
          editable={!start.pending}
          maxLength={300}
        />
        <TextField
          label="Narrative arc"
          placeholder="The strategic goal, e.g. Deflecting a hostile takeover"
          value={form.value.narrativeArc}
          onChangeText={(text) => update("narrativeArc", text)}
          editable={!start.pending}
          maxLength={300}
          multiline
        />
        <SelectField
          label="Learning focus"
          options={LEARNING_FOCUS_OPTIONS}
          value={form.value.learningFocus}
          onChange={(value) => update("learningFocus", value)}
          allowCustom={false}
        />
        <SelectField
          label="Difficulty"
          options={DIFFICULTY_OPTIONS}
          value={form.value.difficultyLevel}
          onChange={(value) => update("difficultyLevel", value)}
          allowCustom={false}
        />
        <TextField
          label="Industry context (optional)"
          placeholder="e.g. Biotech, FinTech"
          value={form.value.industryContext}
          onChangeText={(text) => update("industryContext", text)}
          editable={!start.pending}
          maxLength={200}
        />
        <ActionButton
          label={start.pending ? "Setting the scene…" : session.value ? "Start a new simulation" : "Start simulation"}
          icon={Sparkles}
          loading={start.pending}
          onPress={handleStart}
        />
        <ErrorText message={start.error} />
      </Panel>

      {session.value ? (
        <SimulationBoard session={session.value} pending={pending} error={respond.error} onRespond={handleRespond} />
      ) : (
        <Panel>
          <SectionTitle icon={Briefcase} title="No simulation yet" />
          <Text style={[styles.empty, { color: colors.mutedForeground }]}>
            Define your role and strategic goal to enter the boardroom.
          </Text>
        </Panel>
      )}

      <ActionButton label="Reset" icon={RefreshCcw} variant="outline" onPress={handleReset} />
    </Section>
  );
}

const styles = StyleSheet.create({
  empty: {
    fontSize: 14,
    lineHeight: 20,
  },
});

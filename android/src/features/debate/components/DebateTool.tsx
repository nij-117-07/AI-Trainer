// src/features/debate/components/DebateTool.tsx
/**
 * Debate Engine: build opposing Pro and Con personas, play both sides turn by turn (typing each
 * statement or generating it with AI), then get the judge's verdict. Personas can be edited or
 * regenerated at any point. The form and the debate stay on the device until Reset.
 */
import { useState } from "react";
import { StyleSheet, Text } from "react-native";
import { RefreshCcw, Swords } from "lucide-react-native";
import { useThemeColors } from "@/theme";
import { useAiSettings } from "@/features/ai-settings/providers/AiSettingsProvider";
import { ActionButton, ErrorText, Panel, TextField } from "@/components/tool/FormControls";
import { CountSlider } from "@/components/tool/CountSlider";
import { Section } from "@/components/tool/Section";
import { LIMITS } from "../options";
import { DEBATE_STORAGE_KEYS, FORM_DEFAULTS, restoreForm, restoreSession } from "../lib/persistence";
import { createPersonas, judgeDebate, takeTurn } from "../lib/generators";
import { appendStatement, buildJudgeInput, buildTurnInput, createSession } from "../lib/session";
import { buildPersonaInput, requireText } from "../lib/validate";
import type {
  DebateSession,
  DebateSide,
  JudgeInput,
  PersonaFormValues,
  PersonaInput,
  PersonaProfile,
  TurnInput,
  TurnPayload,
} from "../types";
import { useAbortableTask } from "../hooks/useAbortableTask";
import { useStoredDocument } from "../hooks/useStoredDocument";
import { DebateBoard } from "./DebateBoard";

function messageOf(err: unknown): string {
  return err instanceof Error ? err.message : "Something went wrong. Please try again.";
}

export function DebateTool() {
  const colors = useThemeColors();
  const { settings } = useAiSettings();
  const form = useStoredDocument<PersonaFormValues>(DEBATE_STORAGE_KEYS.form, FORM_DEFAULTS, restoreForm);
  const session = useStoredDocument<DebateSession | null>(DEBATE_STORAGE_KEYS.session, null, restoreSession);
  const build = useAbortableTask(createPersonas);
  const regen = useAbortableTask(createPersonas);
  const turn = useAbortableTask(takeTurn);
  const judge = useAbortableTask(judgeDebate);
  const [formError, setFormError] = useState<string | null>(null);
  const [boardError, setBoardError] = useState<string | null>(null);

  const current = session.value;
  const busy = build.pending || regen.pending || turn.pending || judge.pending;

  function updateForm<K extends keyof PersonaFormValues>(key: K, value: PersonaFormValues[K]) {
    form.setValue((prev) => ({ ...prev, [key]: value }));
  }

  function savePersona(side: DebateSide, persona: PersonaProfile) {
    session.setValue((prev) => {
      if (!prev) return prev;
      return side === "pro" ? { ...prev, proPersona: persona } : { ...prev, conPersona: persona };
    });
  }

  async function handleStart() {
    setFormError(null);
    let inputs: PersonaInput[];
    try {
      inputs = [buildPersonaInput(form.value, "pro"), buildPersonaInput(form.value, "con")];
    } catch (err) {
      setFormError(messageOf(err));
      return;
    }
    const personas = await build.run(settings, inputs);
    if (personas) session.setValue(createSession(inputs[0].topic, personas[0], personas[1]));
  }

  async function handleRegenerate(side: DebateSide) {
    setBoardError(null);
    let input: PersonaInput;
    try {
      input = buildPersonaInput(form.value, side);
    } catch (err) {
      setBoardError(messageOf(err));
      return;
    }
    const personas = await regen.run(settings, [input]);
    const persona = personas?.[0];
    if (persona) savePersona(side, persona);
  }

  async function handleTurn(payload: TurnPayload) {
    const snapshot = session.value;
    if (!snapshot) return;
    setBoardError(null);
    if (payload.mode === "type") {
      let statement: string;
      try {
        statement = requireText(payload.text, "Statement", LIMITS.statement);
      } catch (err) {
        setBoardError(messageOf(err));
        return;
      }
      session.setValue((prev) => (prev ? appendStatement(prev, payload.side, statement, null) : prev));
      return;
    }
    let input: TurnInput;
    try {
      input = buildTurnInput(snapshot, payload);
    } catch (err) {
      setBoardError(messageOf(err));
      return;
    }
    const response = await turn.run(settings, input);
    if (response) {
      session.setValue((prev) => (prev ? appendStatement(prev, payload.side, response.spokenArgument, response) : prev));
    }
  }

  async function handleJudge() {
    const snapshot = session.value;
    if (!snapshot) return;
    setBoardError(null);
    let input: JudgeInput;
    try {
      input = buildJudgeInput(snapshot);
    } catch (err) {
      setBoardError(messageOf(err));
      return;
    }
    const verdict = await judge.run(settings, input);
    if (verdict) session.setValue((prev) => (prev ? { ...prev, complete: true, verdict } : prev));
  }

  function handleReset() {
    build.cancel();
    regen.cancel();
    turn.cancel();
    judge.cancel();
    setFormError(null);
    setBoardError(null);
    session.setValue(null);
    form.setValue(FORM_DEFAULTS);
  }

  return (
    <Section>
      <Panel>
        <TextField
          label="Archetype"
          placeholder="e.g. Cynical Academic, Aggressive Trial Lawyer"
          value={form.value.archetype}
          onChangeText={(text) => updateForm("archetype", text)}
          editable={!build.pending}
          maxLength={LIMITS.archetype}
        />
        <TextField
          label="Speech style"
          placeholder="e.g. sesquipedalian, punchy and short, data-driven"
          value={form.value.style}
          onChangeText={(text) => updateForm("style", text)}
          editable={!build.pending}
          maxLength={LIMITS.style}
        />
        <CountSlider
          label="Rhetorical intensity"
          min={1}
          max={10}
          value={form.value.intensity}
          onChange={(value) => updateForm("intensity", value)}
        />
        <TextField
          label="Influences"
          placeholder="Comma-separated, e.g. Sartre, Game Theory"
          value={form.value.influences}
          onChangeText={(text) => updateForm("influences", text)}
          editable={!build.pending}
          maxLength={LIMITS.influences}
        />
        <TextField
          label="Debate topic"
          placeholder="e.g. Universal Basic Income"
          value={form.value.topic}
          onChangeText={(text) => updateForm("topic", text)}
          editable={!build.pending}
          maxLength={LIMITS.topic}
        />
        <TextField
          label="Custom constraints (optional)"
          placeholder="e.g. Never uses emojis"
          value={form.value.customConstraints}
          onChangeText={(text) => updateForm("customConstraints", text)}
          editable={!build.pending}
          maxLength={LIMITS.constraints}
        />
        <ActionButton
          label={build.pending ? "Crafting the persona…" : current ? "Build a new persona" : "Build persona"}
          icon={Swords}
          loading={build.pending}
          onPress={handleStart}
        />
        <ErrorText message={formError ?? build.error} />
      </Panel>

      {current ? (
        <>
          <DebateBoard
            session={current}
            busy={busy}
            regenPending={regen.pending}
            error={boardError ?? turn.error ?? judge.error ?? regen.error}
            onTurn={handleTurn}
            onJudge={handleJudge}
            onSavePersona={savePersona}
            onRegenerate={handleRegenerate}
          />
          <ActionButton label="Reset debate" icon={RefreshCcw} variant="outline" onPress={handleReset} />
        </>
      ) : (
        <Text style={[styles.empty, { color: colors.mutedForeground }]}>
          Define an archetype, style, and topic, then face your opponent.
        </Text>
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

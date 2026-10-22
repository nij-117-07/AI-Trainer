// src/features/practice/debate/components/pages/DebatePage.tsx
/**
 * Debate Engine page: build a persona, debate it turn by turn, and get the
 * judge's verdict.
 */
"use client";

import { useRef } from "react";
import { Swords } from "lucide-react";
import { ExplainerPageShell } from "@/features/learning/explainer/components/ExplainerPageShell";
import { DraftStatus } from "@/features/learning/explainer/components/DraftStatus";
import { FormActions } from "@/features/learning/explainer/components/FormActions";
import { EmptyResult } from "@/features/learning/explainer/components/EmptyResult";
import {
  InputField,
  SliderField,
} from "@/features/learning/explainer/components/fields";
import { usePersistedForm } from "@/features/learning/explainer/hooks/usePersistedForm";
import { usePersistedState } from "@/features/learning/explainer/hooks/usePersistedState";
import { useToolRequest } from "@/features/learning/explainer/hooks/useToolRequest";
import { createPersonaAction, debateTurnAction, judgeDebateAction } from "../../actions";
import {
  PersonaFormSchema,
  type DebateSession,
  type DebateSide,
  type PersonaFormValues,
  type PersonaProfile,
  type PersonaResponse,
  type TurnPayload,
  type DebateTurnResponse,
  type JudgeResponse,
} from "../../types";
import { DebateBoard } from "../results/DebateBoard";

const STORAGE_KEY = "practice.debate.form.v1";
const SESSION_KEY = "practice.debate.session.v2";

const DEFAULTS: PersonaFormValues = {
  archetype: "Cynical Academic",
  style: "data-driven",
  intensity: 7,
  influences: "Keynes, Behavioral Economics",
  topic: "Universal Basic Income",
  side: "con",
};

export function DebatePage() {
  const persisted = usePersistedForm<PersonaFormValues, PersonaResponse>({
    schema: PersonaFormSchema,
    storageKey: STORAGE_KEY,
    defaults: DEFAULTS,
  });
  const session = usePersistedState<DebateSession | null>({
    key: SESSION_KEY,
    initialValue: null,
  });

  const start = useToolRequest<PersonaFormValues, { pro: PersonaProfile; con: PersonaProfile }>({
    run: async (values) => {
      const [pro, con] = await Promise.all([
        createPersonaAction({ ...values, side: "pro" }),
        createPersonaAction({ ...values, side: "con" }),
      ]);
      return { pro: pro.persona, con: con.persona };
    },
    onSuccess: (result) => {
      const values = persisted.form.getValues();
      session.setValue({
        topic: values.topic,
        proPersona: result.pro,
        conPersona: result.con,
        history: [],
        log: [
          {
            role: "assistant",
            content: `**${result.pro.persona_name}** (for) and **${result.con.persona_name}** (against) are ready on "${values.topic}". Each turn, pick a side and either type the argument yourself or generate it with AI.`,
          },
        ],
        lastTurn: null,
        proTranscript: "",
        conTranscript: "",
        complete: false,
        verdict: null,
      });
    },
  });

  const appendStatement = (
    prev: DebateSession,
    side: DebateSide,
    statement: string,
    lastTurn: DebateTurnResponse | null
  ): DebateSession => {
    const persona = side === "pro" ? prev.proPersona : prev.conPersona;
    const sideLabel = side.toUpperCase();
    return {
      ...prev,
      history: [...prev.history, { role: "user", content: statement }],
      log: [
        ...prev.log,
        { role: "assistant", content: `**${sideLabel} (${persona.persona_name})**: ${statement}` },
      ],
      lastTurn,
      proTranscript: side === "pro" ? prev.proTranscript + `${statement}\n\n` : prev.proTranscript,
      conTranscript: side === "con" ? prev.conTranscript + `${statement}\n\n` : prev.conTranscript,
    };
  };

  const turn = useToolRequest<TurnPayload, { response: DebateTurnResponse; side: DebateSide }>({
    run: async ({ side, text, strategy, evidence }) => {
      const current = session.value;
      if (!current) throw new Error("No active debate session.");
      const persona = side === "pro" ? current.proPersona : current.conPersona;
      const response = await debateTurnAction({
        system_prompt: persona.system_prompt,
        topic: current.topic,
        history: current.history,
        strategy,
        evidence: evidence || undefined,
        instructions: text || "Keep the spoken argument concise.",
      });
      return { response, side };
    },
    onSuccess: ({ response, side }) => {
      const current = session.value;
      if (!current) return;
      session.setValue((prev) =>
        prev ? appendStatement(prev, side, response.spoken_argument, response) : prev
      );
    },
  });

  const regenSideRef = useRef<DebateSide>("pro");
  const regen = useToolRequest<DebateSide, PersonaResponse>({
    run: (side) => {
      const values = persisted.form.getValues();
      return createPersonaAction({ ...values, side });
    },
    onSuccess: (result) => {
      const side = regenSideRef.current;
      session.setValue((prev) => {
        if (!prev) return prev;
        return side === "pro"
          ? { ...prev, proPersona: result.persona }
          : { ...prev, conPersona: result.persona };
      });
    },
  });

  const judge = useToolRequest<{ session: DebateSession }, JudgeResponse>({
    run: async ({ session: current }) =>
      judgeDebateAction({
        topic: current.topic,
        pro_transcript: current.proTranscript,
        con_transcript: current.conTranscript,
      }),
    onSuccess: (result) => {
      const current = session.value;
      if (!current) return;
      session.setValue({ ...current, complete: true, verdict: result });
    },
  });

  const errors = persisted.form.formState.errors;
  const isPending = start.isPending || turn.isPending || judge.isPending || regen.isPending;

  const handleNewDebate = () => {
    session.setValue(null);
    persisted.resetDraft();
  };

  const handleTurn = (payload: TurnPayload) => {
    const current = session.value;
    if (!current) return;
    if (payload.mode === "type") {
      session.setValue((prev) =>
        prev ? appendStatement(prev, payload.side, payload.text.trim(), null) : prev
      );
    } else {
      turn.execute(payload);
    }
  };

  const handleJudge = () => {
    const current = session.value;
    if (current) judge.execute({ session: current });
  };

  const handleUpdatePersona = (side: DebateSide, persona: PersonaProfile) => {
    session.setValue((prev) => {
      if (!prev) return prev;
      return side === "pro"
        ? { ...prev, proPersona: persona }
        : { ...prev, conPersona: persona };
    });
  };

  const handleRegenerate = (side: DebateSide) => {
    regenSideRef.current = side;
    regen.execute(side);
  };

  return (
    <ExplainerPageShell
      title="Debate Engine"
      description="Generate opposing Pro and Con personas, play both sides turn by turn — typing statements yourself or generating them with AI — and get a judge's verdict. Edit either persona anytime."
      headerAction={
        <DraftStatus
          status={persisted.status}
          onReset={handleNewDebate}
          onClear={handleNewDebate}
          disabled={isPending}
        />
      }
      form={
        <form onSubmit={persisted.form.handleSubmit(start.execute)} className="space-y-4">
          <InputField
            label="Archetype"
            htmlFor="debate_archetype"
            placeholder="e.g. Cynical Academic, Aggressive Trial Lawyer"
            disabled={start.isPending}
            {...persisted.form.register("archetype")}
            error={errors.archetype?.message}
          />
          <InputField
            label="Speech Style"
            htmlFor="debate_style"
            placeholder="e.g. sesquipedalian, punchy and short, data-driven"
            disabled={start.isPending}
            {...persisted.form.register("style")}
            error={errors.style?.message}
          />
          <SliderField
            label="Rhetorical Intensity"
            name="intensity"
            htmlFor="debate_intensity"
            control={persisted.form.control}
            min={1}
            max={10}
            formatValue={(value) => `${value}/10`}
            disabled={start.isPending}
          />
          <InputField
            label="Influences"
            htmlFor="debate_influences"
            placeholder="Comma-separated, e.g. Sartre, Game Theory"
            disabled={start.isPending}
            {...persisted.form.register("influences")}
            error={errors.influences?.message}
          />
          <InputField
            label="Debate Topic"
            htmlFor="debate_topic"
            placeholder="e.g. Universal Basic Income"
            disabled={start.isPending}
            {...persisted.form.register("topic")}
            error={errors.topic?.message}
          />
          <InputField
            label="Custom Constraints (optional)"
            htmlFor="debate_constraints"
            placeholder="e.g. Never uses emojis"
            disabled={start.isPending}
            {...persisted.form.register("custom_constraints")}
            error={errors.custom_constraints?.message}
          />
          <FormActions
            isPending={start.isPending}
            error={start.error}
            submitLabel={session.value ? "Build a new persona" : "Build persona"}
            submitPendingLabel="Crafting the persona…"
          />
        </form>
      }
      result={
        session.value ? (
          <DebateBoard
            session={session.value}
            isPending={isPending}
            error={turn.error ?? judge.error ?? regen.error}
            onTurn={handleTurn}
            onJudge={handleJudge}
            onUpdatePersona={handleUpdatePersona}
            onRegenerate={handleRegenerate}
            regenPending={regen.isPending}
          />
        ) : (
          <EmptyResult
            icon={Swords}
            title="No persona yet"
            description="Define an archetype, style, and topic, then face your opponent."
          />
        )
      }
    />
  );
}

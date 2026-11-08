// src/features/debate/components/DebateBoard.tsx
/**
 * The debate in progress: both personas, the last AI turn's breakdown, the transcript, a composer
 * that adds a statement by hand or generates one with AI, and the end-and-judge action.
 */
import { useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { Crosshair, Gavel, MessageSquare, MessageSquareQuote, Wand2 } from "lucide-react-native";
import { radius, spacing, useThemeColors } from "@/theme";
import { ActionButton, ChoiceChips, ErrorText, Panel, TextField } from "@/components/tool/FormControls";
import { MarkdownText } from "@/components/tool/MarkdownText";
import { ResultCallout } from "@/components/tool/ResultCallout";
import { SectionTitle } from "@/components/tool/SectionTitle";
import { SelectField } from "@/components/tool/SelectField";
import { TagList } from "@/components/tool/TagList";
import { LIMITS, MODE_CHOICES, SIDE_CHOICES, STRATEGY_OPTIONS } from "../options";
import { textList } from "../lib/text";
import type { DebateSession, DebateSide, DebateTurn, PersonaProfile, TurnMode, TurnPayload, TurnStrategy } from "../types";
import { DebateVerdictCard } from "./DebateVerdictCard";
import { PersonaCard } from "./PersonaCard";

interface DebateBoardProps {
  session: DebateSession;
  busy: boolean;
  regenPending: boolean;
  error: string | null;
  onTurn: (payload: TurnPayload) => void;
  onJudge: () => void;
  onSavePersona: (side: DebateSide, persona: PersonaProfile) => void;
  onRegenerate: (side: DebateSide) => void;
}

export function DebateBoard({
  session,
  busy,
  regenPending,
  error,
  onTurn,
  onJudge,
  onSavePersona,
  onRegenerate,
}: DebateBoardProps) {
  const colors = useThemeColors();
  const [side, setSide] = useState<DebateSide>("pro");
  const [mode, setMode] = useState<TurnMode>("type");
  const [text, setText] = useState("");
  const [strategy, setStrategy] = useState<TurnStrategy>("counter");
  const [evidence, setEvidence] = useState("");

  const sideLabel = side === "pro" ? "Pro" : "Con";
  const canSubmit = !busy && (mode === "ai" || text.trim().length > 0);
  const log = textList(session.log);

  function submit() {
    if (!canSubmit) return;
    onTurn({ side, mode, text: text.trim(), strategy, evidence: evidence.trim() });
    setText("");
    setEvidence("");
  }

  return (
    <View style={styles.stack}>
      <Panel>
        <View style={styles.headerRow}>
          <View style={[styles.pill, { borderColor: colors.border }]}>
            <Text style={[styles.pillText, { color: colors.foreground }]}>
              {session.complete ? "Judged" : "Debating"}
            </Text>
          </View>
          <Text style={[styles.topic, { color: colors.foreground }]}>{session.topic}</Text>
        </View>
        {!session.complete && (
          <ActionButton
            label="End & judge"
            icon={Gavel}
            variant="outline"
            onPress={() => {
              if (!busy) onJudge();
            }}
          />
        )}
      </Panel>

      <PersonaCard
        side="pro"
        persona={session.proPersona}
        topic={session.topic}
        busy={busy}
        regenPending={regenPending}
        onSave={(persona) => onSavePersona("pro", persona)}
        onRegenerate={() => onRegenerate("pro")}
      />
      <PersonaCard
        side="con"
        persona={session.conPersona}
        topic={session.topic}
        busy={busy}
        regenPending={regenPending}
        onSave={(persona) => onSavePersona("con", persona)}
        onRegenerate={() => onRegenerate("con")}
      />

      {session.verdict && <DebateVerdictCard verdict={session.verdict} />}
      {session.lastTurn && !session.complete && <TurnBreakdown turn={session.lastTurn} />}

      <Panel>
        <SectionTitle icon={MessageSquare} title="Transcript" />
        {log.map((entry, index) => (
          <View key={index} style={[styles.entry, { borderColor: colors.border }]}>
            <MarkdownText content={entry} />
          </View>
        ))}
      </Panel>

      {!session.complete && (
        <Panel>
          <ChoiceChips options={SIDE_CHOICES} value={side} onChange={setSide} wrap={false} />
          <ChoiceChips options={MODE_CHOICES} value={mode} onChange={setMode} />
          {mode === "ai" && (
            <>
              <TextField
                label="Evidence (optional)"
                placeholder="Facts or data to anchor this turn"
                value={evidence}
                onChangeText={setEvidence}
                editable={!busy}
                maxLength={LIMITS.evidence}
              />
              <SelectField
                label="Strategy"
                options={STRATEGY_OPTIONS}
                value={strategy}
                onChange={(value) => setStrategy(value as TurnStrategy)}
                allowCustom={false}
              />
            </>
          )}
          <TextField
            label={mode === "ai" ? "Direction (optional)" : `${sideLabel} statement`}
            placeholder={
              mode === "ai"
                ? `Optional direction for the ${sideLabel} AI, e.g. "attack the cost argument"`
                : `Write the ${sideLabel} statement…`
            }
            value={text}
            onChangeText={setText}
            editable={!busy}
            multiline
            maxLength={mode === "ai" ? LIMITS.direction : LIMITS.statement}
          />
          <ActionButton
            label={busy ? "Working…" : mode === "ai" ? `Generate ${sideLabel} statement` : `Add ${sideLabel} statement`}
            icon={mode === "ai" ? Wand2 : Gavel}
            loading={busy}
            onPress={submit}
          />
          <ErrorText message={error} />
        </Panel>
      )}
    </View>
  );
}

function TurnBreakdown({ turn }: { turn: DebateTurn }) {
  const colors = useThemeColors();
  return (
    <Panel>
      <SectionTitle icon={Crosshair} title="Turn breakdown" />
      <Detail title="Opponent analysis" text={turn.opponentAnalysis} />
      <Detail title="Core claim" text={turn.coreClaim} />
      <Detail title="Reasoning & evidence" text={turn.reasoningAndEvidence} />
      <TagList items={textList(turn.rhetoricalDevices)} />
      <ResultCallout icon={MessageSquareQuote} title="Closing question" tone="sky">
        <Text style={[styles.body, { color: colors.foreground }]}>{turn.closingQuestion}</Text>
      </ResultCallout>
    </Panel>
  );
}

function Detail({ title, text }: { title: string; text: string }) {
  const colors = useThemeColors();
  return (
    <View style={styles.detail}>
      <Text style={[styles.label, { color: colors.mutedForeground }]}>{title}</Text>
      <Text style={[styles.body, { color: colors.foreground }]}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  stack: {
    gap: spacing.lg,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    gap: spacing.sm,
  },
  pill: {
    borderWidth: 1,
    borderRadius: radius.full,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
  },
  pillText: {
    fontSize: 13,
    fontWeight: "600",
  },
  topic: {
    flexShrink: 1,
    fontSize: 15,
    fontWeight: "600",
  },
  entry: {
    borderTopWidth: 1,
    paddingTop: spacing.md,
  },
  detail: {
    gap: spacing.xs,
  },
  label: {
    fontSize: 13,
    fontWeight: "600",
  },
  body: {
    fontSize: 15,
    lineHeight: 22,
  },
});

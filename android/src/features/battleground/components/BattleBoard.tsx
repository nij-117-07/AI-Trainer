// src/features/battleground/components/BattleBoard.tsx
/**
 * The running battleground: health meters, mission brief, the current tactical challenge with an
 * answer composer, the last round's adjudication, and the conclusion once the mission ends.
 */
import { useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { Crosshair, Flag, FileText, Swords } from "lucide-react-native";
import { radius, spacing, useThemeColors } from "@/theme";
import { ActionButton, ErrorText, Panel, TextField } from "@/components/tool/FormControls";
import { MarkdownText } from "@/components/tool/MarkdownText";
import { ResultCallout } from "@/components/tool/ResultCallout";
import { SectionTitle } from "@/components/tool/SectionTitle";
import { TagList } from "@/components/tool/TagList";
import { averageScore } from "../lib/game";
import { textList } from "../lib/text";
import type { BattleSession } from "../types";

interface BattleBoardProps {
  session: BattleSession;
  pending: boolean;
  error: string | null;
  onCommit: (answer: string) => void;
}

export function BattleBoard({ session, pending, error, onCommit }: BattleBoardProps) {
  const colors = useThemeColors();
  const [answer, setAnswer] = useState("");
  const challenge = session.currentChallenge;
  const average = averageScore(session.roundScores) * 100;
  const evaluation = session.lastEvaluation;
  const rules = textList(session.rulesOfEngagement);
  const constraints = challenge ? textList(challenge.constraints) : [];
  const reference = challenge?.referenceMaterial ?? {};

  function submit() {
    const trimmed = answer.trim();
    if (!trimmed || pending) return;
    onCommit(trimmed);
    setAnswer("");
  }

  return (
    <View style={styles.board}>
      <View style={styles.statusRow}>
        <View style={styles.statusPills}>
          <Pill label={`Round ${session.roundNumber}`} filled />
          <Pill label={session.difficulty} />
        </View>
        <Text style={[styles.average, { color: colors.foreground }]}>Avg score: {average.toFixed(0)}%</Text>
      </View>

      <View style={styles.healthRow}>
        <HealthBar label="Your health" value={session.userHealth} tone="emerald" />
        <HealthBar label="Opponent health" value={session.opponentHealth} tone="rose" />
      </View>

      {!session.isActive && (
        <ResultCallout icon={Flag} title="Mission concluded" tone="amber">
          <Text style={[styles.body, { color: colors.foreground }]}>{session.terminationReason}</Text>
          <Text style={[styles.strong, { color: colors.foreground }]}>Final average score: {average.toFixed(1)}%</Text>
        </ResultCallout>
      )}

      <Panel>
        <SectionTitle icon={FileText} title="Mission" />
        <Text style={[styles.body, { color: colors.foreground }]}>{session.missionObjective}</Text>
        {rules.length > 0 && <TagList items={rules} />}
      </Panel>

      {challenge && session.isActive && (
        <Panel>
          <View style={styles.challengeHeader}>
            <SectionTitle icon={Crosshair} title="Tactical challenge" />
            <Pill label={challenge.tacticType || "unspecified"} />
          </View>
          {challenge.briefing !== "" && <MarkdownText content={challenge.briefing} />}
          {challenge.tacticalSituation !== "" && (
            <Text style={[styles.body, { color: colors.foreground }]}>
              <Text style={[styles.strong, { color: colors.mutedForeground }]}>Situation: </Text>
              {challenge.tacticalSituation}
            </Text>
          )}
          {challenge.challenge !== "" && (
            <ResultCallout icon={Swords} title="Your objective" tone="sky">
              <Text style={[styles.body, { color: colors.foreground }]}>{challenge.challenge}</Text>
            </ResultCallout>
          )}
          {challenge.question !== "" && (
            <Text style={[styles.italic, { color: colors.foreground }]}>{challenge.question}</Text>
          )}
          {constraints.length > 0 && <TagList items={constraints} />}
          {Object.keys(reference).length > 0 && (
            <View style={[styles.reference, { backgroundColor: colors.muted }]}>
              <Text style={[styles.strong, { color: colors.mutedForeground }]}>Reference material</Text>
              <MarkdownText content={formatReference(reference)} />
            </View>
          )}
          {challenge.environmentChange !== "" && challenge.environmentChange !== "No significant changes." && (
            <Text style={[styles.note, { color: colors.destructive }]}>{challenge.environmentChange}</Text>
          )}

          <TextField
            label="Your move"
            placeholder="What's your move? Walk through your tactical decision…"
            value={answer}
            onChangeText={setAnswer}
            editable={!pending}
            maxLength={2000}
            multiline
          />
          <ActionButton
            label={pending ? "Resolving your move…" : "Commit to your action"}
            icon={Swords}
            loading={pending}
            onPress={submit}
          />
        </Panel>
      )}

      <ErrorText message={error} />

      {evaluation && (
        <Panel>
          <View style={styles.challengeHeader}>
            <SectionTitle icon={Crosshair} title="Round adjudication" />
            <Text style={[styles.score, { color: colors.foreground }]}>{Math.round(evaluation.score * 100)}%</Text>
          </View>
          <View style={[styles.track, { backgroundColor: colors.muted }]}>
            <View
              style={[
                styles.fill,
                { backgroundColor: colors.primary, width: `${Math.min(100, evaluation.score * 100)}%` },
              ]}
            />
          </View>
          {evaluation.feedback !== "" && <MarkdownText content={evaluation.feedback} />}
          {evaluation.narrative !== "" && (
            <Text style={[styles.italic, { color: colors.mutedForeground }]}>{evaluation.narrative}</Text>
          )}
          <TagList
            items={[
              `You: ${signed(evaluation.hpDeltaUser)} HP`,
              `Opponent: ${signed(evaluation.hpDeltaOpponent)} HP`,
              ...Object.entries(evaluation.resourceImpact).map(([resource, delta]) => `${resource}: ${signed(delta)}`),
            ]}
          />
          {evaluation.battlefieldShift !== "" && (
            <Text style={[styles.body, { color: colors.mutedForeground }]}>{evaluation.battlefieldShift}</Text>
          )}
        </Panel>
      )}
    </View>
  );
}

function HealthBar({ label, value, tone }: { label: string; value: number; tone: "emerald" | "rose" }) {
  const colors = useThemeColors();
  const width = Math.max(0, Math.min(100, value));
  return (
    <View style={styles.health}>
      <View style={styles.healthLabel}>
        <Text style={[styles.strong, { color: colors.foreground }]}>{label}</Text>
        <Text style={[styles.body, { color: colors.mutedForeground }]}>{value} HP</Text>
      </View>
      <View style={[styles.track, { backgroundColor: colors.muted }]}>
        <View style={[styles.fill, { backgroundColor: colors.tone[tone].fg, width: `${width}%` }]} />
      </View>
    </View>
  );
}

function Pill({ label, filled = false }: { label: string; filled?: boolean }) {
  const colors = useThemeColors();
  return (
    <View
      style={[
        styles.pill,
        { borderColor: filled ? colors.primary : colors.border, backgroundColor: filled ? colors.primary : colors.card },
      ]}
    >
      <Text style={[styles.pillText, { color: filled ? colors.primaryForeground : colors.foreground }]}>{label}</Text>
    </View>
  );
}

function formatReference(material: Record<string, string>): string {
  return Object.entries(material)
    .map(([key, value]) => `- **${key.replace(/_/g, " ")}:** ${value}`)
    .join("\n");
}

function signed(value: number): string {
  return `${value >= 0 ? "+" : ""}${value}`;
}

const styles = StyleSheet.create({
  board: {
    gap: spacing.lg,
  },
  statusRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing.md,
  },
  statusPills: {
    flexDirection: "row",
    gap: spacing.sm,
  },
  average: {
    fontSize: 14,
    fontWeight: "600",
  },
  healthRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.lg,
  },
  health: {
    flex: 1,
    minWidth: 140,
    gap: spacing.sm,
  },
  healthLabel: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  track: {
    height: 8,
    borderRadius: radius.full,
    overflow: "hidden",
  },
  fill: {
    height: "100%",
    borderRadius: radius.full,
  },
  challengeHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing.sm,
  },
  score: {
    fontSize: 18,
    fontWeight: "700",
  },
  reference: {
    borderRadius: radius.lg,
    padding: spacing.md,
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
    textTransform: "capitalize",
  },
  body: {
    fontSize: 15,
    lineHeight: 22,
  },
  strong: {
    fontSize: 14,
    fontWeight: "600",
  },
  italic: {
    fontSize: 15,
    lineHeight: 22,
    fontStyle: "italic",
  },
  note: {
    fontSize: 13,
    lineHeight: 18,
  },
});

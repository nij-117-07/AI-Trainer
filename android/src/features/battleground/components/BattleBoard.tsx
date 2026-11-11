// src/features/battleground/components/BattleBoard.tsx
/**
 * The battle on the practice page: health meters, the mission, the current tactical challenge, the
 * round adjudication, and the conclusion once the mission ends. The move box is the page footer
 * (BattleMoveFooter).
 */
import { useEffect, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { CircleCheck, CircleX, Crosshair, FileText, Flag, Minus, Swords, type LucideIcon } from "lucide-react-native";
import { shape, spacing, typeScale, useThemeColors } from "@/theme";
import { ActionButton, Panel } from "@/components/tool/FormControls";
import { AnswerComposer } from "@/components/tool/AnswerComposer";
import { Disclosure } from "@/components/tool/Disclosure";
import { ListenButton } from "@/components/tool/ListenButton";
import { MarkdownText } from "@/components/tool/MarkdownText";
import { ResultCallout } from "@/components/tool/ResultCallout";
import { SectionTitle } from "@/components/tool/SectionTitle";
import { TagList } from "@/components/tool/TagList";
import { useToolScroll } from "@/components/tool/ToolScrollContext";
import type { BattleSessionState } from "../hooks/useBattleSession";
import { averageScore } from "../lib/game";
import { textList } from "../lib/text";
import type { BattleEvaluation, BattleSession } from "../types";

export function BattleBoard({ session, pending }: { session: BattleSession; pending: boolean }) {
  const colors = useThemeColors();
  const router = useRouter();
  const scroll = useToolScroll();
  const challenge = session.currentChallenge;
  const average = averageScore(session.roundScores) * 100;
  const evaluation = session.lastEvaluation;
  const rules = textList(session.rulesOfEngagement);
  const constraints = challenge ? textList(challenge.constraints) : [];
  const reference = challenge?.referenceMaterial ?? {};
  const referenceCount = Object.keys(reference).length;
  const verdict = evaluation ? roundVerdict(evaluation) : null;

  useEffect(() => {
    scroll?.current?.scrollToEnd({ animated: true });
  }, [session.roundScores.length, scroll]);

  return (
    <View style={styles.board}>
      <Panel>
        <View style={styles.statusRow}>
          <View style={styles.statusPills}>
            <Pill label={`Round ${session.roundNumber}`} filled />
            <Pill label={session.difficulty} />
          </View>
          <Text style={[styles.strong, { color: colors.foreground }]}>Avg score: {average.toFixed(0)}%</Text>
        </View>
        <View style={styles.healthRow}>
          <HealthBar label="Your health" value={session.userHealth} />
          <HealthBar label="Opponent health" value={session.opponentHealth} />
        </View>
        {pending && (
          <Text accessibilityLiveRegion="polite" style={[styles.label, { color: colors.mutedForeground }]}>
            Adjudicating your move…
          </Text>
        )}
      </Panel>

      {!session.isActive && (
        <ResultCallout icon={Flag} title="Mission concluded" tone="amber">
          <Text style={[styles.body, { color: colors.foreground }]}>{session.terminationReason}</Text>
          <Text style={[styles.strong, { color: colors.foreground }]}>Final average score: {average.toFixed(1)}%</Text>
        </ResultCallout>
      )}

      <Panel>
        <SectionTitle icon={FileText} title="Mission" />
        <Text style={[styles.body, { color: colors.foreground }]}>{session.missionObjective}</Text>
        <ListenButton text={session.missionObjective} label="Mission" />
        {rules.length > 0 && <TagList items={rules} />}
      </Panel>

      {challenge && session.isActive && (
        <Panel>
          <View style={styles.challengeHeader}>
            <SectionTitle icon={Crosshair} title="Tactical challenge" />
            <Pill label={challenge.tacticType || "unspecified"} />
          </View>
          {challenge.briefing !== "" && <MarkdownText content={challenge.briefing} />}
          <ListenButton text={challenge.briefing} label="Briefing" />
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
          <ListenButton text={challenge.question} label="Question" />
          {constraints.length > 0 && <TagList items={constraints} />}
          {challenge.environmentChange !== "" && challenge.environmentChange !== "No significant changes." && (
            <Text style={[styles.label, { color: colors.mutedForeground }]}>{challenge.environmentChange}</Text>
          )}
        </Panel>
      )}

      {challenge && session.isActive && referenceCount > 0 && (
        <Disclosure
          title="Reference material"
          icon={FileText}
          summary={`${referenceCount} ${referenceCount === 1 ? "item" : "items"}`}
        >
          <MarkdownText content={formatReference(reference)} />
        </Disclosure>
      )}

      {evaluation && verdict && (
        <Disclosure
          title="Round adjudication"
          icon={Crosshair}
          summary={`${Math.round(evaluation.score * 100)}% · You ${signed(evaluation.hpDeltaUser)} HP · Opponent ${signed(evaluation.hpDeltaOpponent)} HP`}
          defaultOpen
        >
          <View style={styles.verdictRow}>
            <verdict.Icon size={18} color={verdict.tone === "bad" ? colors.destructive : colors.foreground} />
            <Text accessibilityLiveRegion="polite" style={[styles.strong, { color: colors.foreground }]}>
              {verdict.text}
            </Text>
          </View>
          <View
            accessibilityRole="progressbar"
            accessibilityLabel="Round score"
            accessibilityValue={{ min: 0, max: 100, now: Math.round(Math.min(100, evaluation.score * 100)) }}
            style={[styles.track, { backgroundColor: colors.muted }]}
          >
            <View
              style={[
                styles.fill,
                { backgroundColor: colors.primary, width: `${Math.min(100, evaluation.score * 100)}%` },
              ]}
            />
          </View>
          {evaluation.feedback !== "" && <MarkdownText content={evaluation.feedback} />}
          <ListenButton text={evaluation.feedback} label="Feedback" />
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
            <Text style={[styles.label, { color: colors.mutedForeground }]}>{evaluation.battlefieldShift}</Text>
          )}
        </Disclosure>
      )}

      {session.isActive && (
        <ActionButton
          label="Start a different battle"
          icon={Swords}
          variant="outline"
          disabled={pending}
          onPress={() => router.push("/practice/battleground/new")}
        />
      )}
    </View>
  );
}

export function BattleMoveFooter({ battle }: { battle: BattleSessionState }) {
  const [answer, setAnswer] = useState("");

  async function submit() {
    const trimmed = answer.trim();
    if (!trimmed || battle.pending) return;
    if (await battle.commit(trimmed)) setAnswer("");
  }

  return (
    <AnswerComposer
      label="Your move"
      value={answer}
      placeholder="Describe your move…"
      maxLength={2000}
      pending={battle.pending}
      error={battle.error}
      submitLabel="Submit move"
      onChangeText={setAnswer}
      onSubmit={() => void submit()}
    />
  );
}

function HealthBar({ label, value }: { label: string; value: number }) {
  const colors = useThemeColors();
  const width = Math.max(0, Math.min(100, value));
  return (
    <View style={styles.health}>
      <View style={styles.healthLabel}>
        <Text style={[styles.strong, { color: colors.foreground }]}>{label}</Text>
        <Text style={[styles.label, { color: colors.mutedForeground }]}>{value} HP</Text>
      </View>
      <View
        accessibilityRole="progressbar"
        accessibilityLabel={label}
        accessibilityValue={{ min: 0, max: 100, now: width, text: `${value} HP` }}
        style={[styles.track, { backgroundColor: colors.muted }]}
      >
        <View style={[styles.fill, { backgroundColor: colors.primary, width: `${width}%` }]} />
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

/** Says who gained ground this round, from the HP deltas. Opponent deltas are never positive. */
function roundVerdict(evaluation: BattleEvaluation): { text: string; Icon: LucideIcon; tone: "good" | "bad" | "even" } {
  if (evaluation.hpDeltaOpponent < 0 && evaluation.hpDeltaUser >= 0) {
    return { text: "You gained ground", Icon: CircleCheck, tone: "good" };
  }
  if (evaluation.hpDeltaUser < 0 && evaluation.hpDeltaOpponent === 0) {
    return { text: "Opponent gained ground", Icon: CircleX, tone: "bad" };
  }
  return { text: "Even round", Icon: Minus, tone: "even" };
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
    borderRadius: shape.full,
    overflow: "hidden",
  },
  fill: {
    height: "100%",
    borderRadius: shape.full,
  },
  challengeHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing.sm,
  },
  verdictRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  pill: {
    borderWidth: 1,
    borderRadius: shape.full,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
  },
  pillText: {
    ...typeScale.label,
    fontWeight: "600",
    textTransform: "capitalize",
  },
  body: {
    ...typeScale.body,
  },
  strong: {
    ...typeScale.label,
    fontWeight: "600",
  },
  italic: {
    ...typeScale.body,
    fontStyle: "italic",
  },
  label: {
    ...typeScale.label,
    fontWeight: "400",
  },
});

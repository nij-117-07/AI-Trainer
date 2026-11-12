// src/features/battleground/components/BattleBoard.tsx
/**
 * The battle log. Each round reads as a chat: the opponent's briefing on the left, the move on the
 * right, and the adjudication under it. The current briefing is the last entry. The log fills the
 * space between the header and the footer. The move box is the page footer (BattleMoveFooter), and
 * the status, your forces, the opponent, and the mission are in the sidebar (BattleSidebar).
 */
import { useEffect, useRef, useState, type ReactNode } from "react";
import { ScrollView, StyleSheet, Text, View, type ScrollViewInstance } from "react-native";
import { CircleCheck, CircleX, Crosshair, FileText, Flag, Minus, Send, Swords, type LucideIcon } from "lucide-react-native";
import { shape, spacing, typeScale, useThemeColors } from "@/theme";
import { AnswerComposer } from "@/components/tool/AnswerComposer";
import { Disclosure } from "@/components/tool/Disclosure";
import { ListenButton } from "@/components/tool/ListenButton";
import { MarkdownText } from "@/components/tool/MarkdownText";
import { Panel } from "@/components/tool/FormControls";
import { ResultCallout } from "@/components/tool/ResultCallout";
import { SectionTitle } from "@/components/tool/SectionTitle";
import { TagList } from "@/components/tool/TagList";
import type { BattleSessionState } from "../hooks/useBattleSession";
import { averageScore } from "../lib/game";
import { textList } from "../lib/text";
import type { BattleChallenge, BattleEvaluation, BattleRound, BattleSession } from "../types";
import { Pill, ProgressTrack } from "./BattleParts";

export function BattleBoard({ session, pending }: { session: BattleSession; pending: boolean }) {
  const colors = useThemeColors();
  const scroll = useRef<ScrollViewInstance>(null);
  const challenge = session.currentChallenge;
  const showChallenge = session.isActive && challenge !== null;
  const average = Math.round(averageScore(session.roundScores) * 100);

  useEffect(() => {
    scroll.current?.scrollToEnd({ animated: true });
  }, [session.rounds.length, session.isActive]);

  return (
    <Panel style={styles.chat}>
      <View style={styles.chatHeader}>
        <SectionTitle icon={Swords} title="Battle log" />
        {pending ? (
          <Text accessibilityLiveRegion="polite" style={[styles.status, { color: colors.mutedForeground }]}>
            Adjudicating your move…
          </Text>
        ) : null}
      </View>
      <ScrollView ref={scroll} style={styles.chatScroll} nestedScrollEnabled>
        <View style={styles.log}>
          {session.rounds.map((round, index) => (
            <RoundEntry key={index} round={round} number={index + 1} />
          ))}
          {showChallenge && challenge && (
            <ChallengeEntry challenge={challenge} number={session.roundNumber} collapsed={false} />
          )}
          {!session.isActive && (
            <ResultCallout icon={Flag} title="Mission concluded" tone="amber">
              <Text style={[styles.body, { color: colors.foreground }]}>{session.terminationReason}</Text>
              <Text style={[styles.strong, { color: colors.foreground }]}>Final average score: {average}%</Text>
            </ResultCallout>
          )}
          {session.rounds.length === 0 && !showChallenge && (
            <Text style={[styles.body, { color: colors.mutedForeground }]}>No moves yet.</Text>
          )}
        </View>
      </ScrollView>
    </Panel>
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
      submitIcon={Send}
      onChangeText={setAnswer}
      onSubmit={() => void submit()}
    />
  );
}

function RoundEntry({ round, number }: { round: BattleRound; number: number }) {
  const colors = useThemeColors();
  return (
    <View style={styles.round}>
      <ChallengeEntry challenge={round.challenge} number={number} collapsed />
      <Message align="end" label="You">
        <Text style={[styles.body, { color: colors.primaryForeground }]}>{round.answer}</Text>
      </Message>
      <AdjudicationCard evaluation={round.evaluation} />
    </View>
  );
}

function ChallengeEntry({ challenge, number, collapsed }: { challenge: BattleChallenge; number: number; collapsed: boolean }) {
  const colors = useThemeColors();
  const question = challenge.question.trim();
  const spoken = [challenge.briefing, question].filter((part) => part !== "").join("\n\n");
  const details = textList(challenge.constraints);
  const reference = Object.keys(challenge.referenceMaterial).length;

  const body = (
    <View style={styles.bubbleBody}>
      <Pill label={challenge.tacticType || "unspecified"} />
      {challenge.briefing !== "" && <MarkdownText content={challenge.briefing} />}
      {challenge.challenge !== "" && (
        <Text style={[styles.body, { color: colors.foreground }]}>
          <Text style={styles.strong}>Objective: </Text>
          {challenge.challenge}
        </Text>
      )}
      {question !== "" && <Text style={[styles.italic, { color: colors.foreground }]}>{question}</Text>}
      {challenge.tacticalSituation !== "" && (
        <Text style={[styles.label, { color: colors.mutedForeground }]}>Situation: {challenge.tacticalSituation}</Text>
      )}
      {details.length > 0 && <TagList items={details} />}
      {challenge.environmentChange !== "" && challenge.environmentChange !== "No significant changes." && (
        <Text style={[styles.label, { color: colors.mutedForeground }]}>{challenge.environmentChange}</Text>
      )}
      {reference > 0 && <MarkdownText content={formatReference(challenge.referenceMaterial)} />}
      <View style={styles.listenRow}>
        <ListenButton text={spoken} label={`Round ${number} briefing`} />
      </View>
    </View>
  );

  return (
    <Message align="start" label={`Opponent · Round ${number}`}>
      {collapsed ? (
        <Disclosure title="Briefing" icon={FileText} summary={question || challenge.challenge || "Open the briefing"}>
          {body}
        </Disclosure>
      ) : (
        body
      )}
    </Message>
  );
}

function AdjudicationCard({ evaluation }: { evaluation: BattleEvaluation }) {
  const colors = useThemeColors();
  const verdict = roundVerdict(evaluation);
  const percent = Math.round(Math.min(100, evaluation.score * 100));
  const resources = Object.entries(evaluation.resourceImpact).map(([resource, delta]) => `${resource}: ${signed(delta)}`);
  const hasDetails = evaluation.narrative !== "" || evaluation.battlefieldShift !== "" || resources.length > 0;

  return (
    <View style={[styles.adjudication, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <View style={styles.verdictRow}>
        <verdict.Icon size={18} color={verdict.tone === "bad" ? colors.destructive : colors.foreground} />
        <Text accessibilityLiveRegion="polite" style={[styles.strong, { color: colors.foreground }]}>
          {verdict.text} · {percent}%
        </Text>
      </View>
      <ProgressTrack label="Round score" value={percent} text={`${percent}%`} />
      <Text style={[styles.label, { color: colors.mutedForeground }]}>
        You {signed(evaluation.hpDeltaUser)} HP · Opponent {signed(evaluation.hpDeltaOpponent)} HP
      </Text>
      {evaluation.feedback !== "" && (
        <>
          <MarkdownText content={evaluation.feedback} />
          <View style={styles.listenRow}>
            <ListenButton text={evaluation.feedback} label="Feedback" />
          </View>
        </>
      )}
      {hasDetails && (
        <Disclosure title="Details" icon={Crosshair} summary="Narrative, battlefield, and resources">
          {evaluation.narrative !== "" && <Text style={[styles.italic, { color: colors.mutedForeground }]}>{evaluation.narrative}</Text>}
          {evaluation.battlefieldShift !== "" && (
            <Text style={[styles.label, { color: colors.mutedForeground }]}>{evaluation.battlefieldShift}</Text>
          )}
          {resources.length > 0 && <TagList items={resources} />}
        </Disclosure>
      )}
    </View>
  );
}

/** A chat bubble: your moves on the right in the primary colour, the opponent's briefings on the left. */
function Message({ align, label, children }: { align: "start" | "end"; label: string; children: ReactNode }) {
  const colors = useThemeColors();
  const mine = align === "end";

  return (
    <View style={[styles.message, mine ? styles.alignEnd : styles.alignStart]}>
      <Text style={[styles.label, { color: colors.mutedForeground }]}>{label}</Text>
      <View
        style={[
          styles.bubble,
          { backgroundColor: mine ? colors.primary : colors.muted, borderColor: mine ? colors.primary : colors.border },
        ]}
      >
        {children}
      </View>
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
  chat: {
    flex: 1,
    minHeight: 0,
    gap: spacing.md,
  },
  chatHeader: {
    gap: spacing.xs,
  },
  chatScroll: {
    flex: 1,
  },
  log: {
    gap: spacing.lg,
  },
  round: {
    gap: spacing.md,
  },
  message: {
    maxWidth: "92%",
    gap: spacing.xs,
  },
  alignStart: {
    alignSelf: "flex-start",
  },
  alignEnd: {
    alignSelf: "flex-end",
  },
  bubble: {
    borderWidth: 1,
    borderRadius: shape.lg,
    padding: spacing.md,
  },
  bubbleBody: {
    gap: spacing.sm,
  },
  listenRow: {
    alignSelf: "flex-end",
  },
  adjudication: {
    borderWidth: 1,
    borderRadius: shape.lg,
    padding: spacing.md,
    gap: spacing.sm,
  },
  verdictRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  status: {
    ...typeScale.label,
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
  },
});

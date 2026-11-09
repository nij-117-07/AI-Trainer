// src/features/negotiation/components/NegotiationBoard.tsx
/**
 * The negotiation in progress: scenario brief, transcript, composer, and the end-and-evaluate
 * step. A session moves from negotiating, to ending (asking for the outcome), to complete (with
 * the report).
 */
import { useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { Flag, Gavel, Send } from "lucide-react-native";
import { radius, spacing, useThemeColors } from "@/theme";
import { ActionButton, ErrorText, Panel, TextField } from "@/components/tool/FormControls";
import { ListenButton } from "@/components/tool/ListenButton";
import { Section } from "@/components/tool/Section";
import type { NegotiationSession } from "../types";
import { NegotiationReport } from "./NegotiationReport";
import { Transcript } from "./Transcript";

interface NegotiationBoardProps {
  session: NegotiationSession;
  busy: boolean;
  error: string | null;
  onSend: (message: string) => Promise<boolean>;
  onEvaluate: (outcome: string) => Promise<boolean>;
}

export function NegotiationBoard({ session, busy, error, onSend, onEvaluate }: NegotiationBoardProps) {
  const colors = useThemeColors();
  const [message, setMessage] = useState("");
  const [ending, setEnding] = useState(false);
  const [outcome, setOutcome] = useState("");
  const { scenario } = session;

  async function send() {
    const text = message.trim();
    if (!text || busy) return;
    const sent = await onSend(text);
    if (sent) setMessage("");
  }

  async function finish() {
    const text = outcome.trim();
    if (!text || busy) return;
    await onEvaluate(text);
  }

  return (
    <Section>
      <Panel>
        <View style={styles.headerRow}>
          <Text style={[styles.title, { color: colors.foreground }]}>{scenario.title || "Negotiation"}</Text>
          {scenario.opponentRole ? (
            <View style={[styles.pill, { borderColor: colors.border }]}>
              <Text style={[styles.pillText, { color: colors.foreground }]}>{scenario.opponentRole}</Text>
            </View>
          ) : null}
        </View>
        {scenario.context ? <Text style={[styles.body, { color: colors.mutedForeground }]}>{scenario.context}</Text> : null}
        <ListenButton text={scenario.context} label="Scenario" />

        <View style={styles.briefGrid}>
          <BriefSide
            heading="Your role"
            role={scenario.yourRole}
            goal={scenario.yourGoal}
            constraints={scenario.yourConstraints}
          />
          <BriefSide
            heading="Opponent"
            role={scenario.opponentRole}
            goal={scenario.opponentGoal}
            constraints={scenario.opponentConstraints}
          />
        </View>
        {scenario.keyIssues.length > 0 ? (
          <Text style={[styles.body, { color: colors.mutedForeground }]}>
            <Text style={[styles.strong, { color: colors.foreground }]}>Issues on the table: </Text>
            {scenario.keyIssues.join(" · ")}
          </Text>
        ) : null}

        {!session.complete && !ending ? (
          <ActionButton label="End & evaluate" icon={Flag} variant="outline" onPress={() => setEnding(true)} />
        ) : null}
      </Panel>

      {session.report ? <NegotiationReport report={session.report} outcome={session.finalOutcome} /> : null}

      <Panel>
        <Transcript entries={session.log} />

        {session.complete ? (
          <View style={styles.closed}>
            <Gavel size={16} color={colors.mutedForeground} />
            <Text style={[styles.body, { color: colors.mutedForeground }]}>
              Session closed — {session.finalOutcome}.
            </Text>
          </View>
        ) : ending ? (
          <View style={styles.composer}>
            <TextField
              label="How did the negotiation end?"
              placeholder="e.g. agreement at $165k base plus two remote days"
              value={outcome}
              onChangeText={setOutcome}
              editable={!busy}
              maxLength={500}
              voice
            />
            <ActionButton
              label={busy ? "Evaluating…" : "Evaluate session"}
              icon={Gavel}
              loading={busy}
              onPress={finish}
            />
            <ActionButton label="Keep negotiating" variant="outline" onPress={() => setEnding(false)} />
          </View>
        ) : (
          <View style={styles.composer}>
            <TextField
              label="Your reply"
              placeholder="Say something to the opponent…"
              value={message}
              onChangeText={setMessage}
              editable={!busy}
              maxLength={2000}
              multiline
              voice
            />
            <ActionButton
              label={busy ? "Opponent is replying…" : "Send"}
              icon={Send}
              loading={busy}
              onPress={send}
            />
          </View>
        )}

        <ErrorText message={error} />
      </Panel>
    </Section>
  );
}

function BriefSide({ heading, role, goal, constraints }: { heading: string; role: string; goal: string; constraints: string }) {
  const colors = useThemeColors();
  return (
    <View style={styles.briefSide}>
      <Text style={[styles.caption, { color: colors.mutedForeground }]}>{heading}</Text>
      <Text style={[styles.strong, { color: colors.foreground }]}>{role || "—"}</Text>
      <Text style={[styles.small, { color: colors.mutedForeground }]}>
        <Text style={[styles.strong, { color: colors.foreground }]}>Goal: </Text>
        {goal || "—"}
      </Text>
      <Text style={[styles.small, { color: colors.mutedForeground }]}>
        <Text style={[styles.strong, { color: colors.foreground }]}>Constraints: </Text>
        {constraints || "—"}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  headerRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing.sm,
  },
  title: {
    flexShrink: 1,
    fontSize: 17,
    fontWeight: "600",
  },
  pill: {
    borderWidth: 1,
    borderRadius: radius.full,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
  },
  pillText: {
    fontSize: 13,
    fontWeight: "500",
  },
  body: {
    fontSize: 14,
    lineHeight: 21,
  },
  briefGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.md,
  },
  briefSide: {
    flexGrow: 1,
    flexBasis: 150,
    gap: spacing.xs,
  },
  caption: {
    fontSize: 12,
    fontWeight: "600",
  },
  strong: {
    fontSize: 14,
    fontWeight: "600",
  },
  small: {
    fontSize: 13,
    lineHeight: 19,
  },
  closed: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  composer: {
    gap: spacing.md,
  },
});

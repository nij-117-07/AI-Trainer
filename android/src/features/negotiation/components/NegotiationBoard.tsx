// src/features/negotiation/components/NegotiationBoard.tsx
/**
 * The negotiation on the practice page: scenario brief, the evaluation report, and the transcript.
 * The reply box lives in the page footer. Ending asks for the outcome there, and the footer switches
 * to the outcome box until the session is evaluated.
 */
import { useEffect } from "react";
import { StyleSheet, Text, View } from "react-native";
import { Flag, Gavel } from "lucide-react-native";
import { radius, spacing, useThemeColors } from "@/theme";
import { ActionButton, Panel } from "@/components/tool/FormControls";
import { ListenButton } from "@/components/tool/ListenButton";
import { useToolScroll } from "@/components/tool/ToolScrollContext";
import type { NegotiationSession } from "../types";
import { NegotiationReport } from "./NegotiationReport";
import { Transcript } from "./Transcript";

interface NegotiationBoardProps {
  session: NegotiationSession;
  busy: boolean;
  ending: boolean;
  onEnd: () => void;
  onKeepNegotiating: () => void;
}

export function NegotiationBoard({ session, busy, ending, onEnd, onKeepNegotiating }: NegotiationBoardProps) {
  const colors = useThemeColors();
  const scroll = useToolScroll();
  const { scenario } = session;

  useEffect(() => {
    scroll?.current?.scrollToEnd({ animated: true });
  }, [session.log.length, busy, scroll]);

  return (
    <>
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

        {!session.complete ? (
          ending ? (
            <ActionButton label="Keep negotiating" variant="outline" onPress={onKeepNegotiating} />
          ) : (
            <ActionButton label="End & evaluate" icon={Flag} variant="outline" onPress={onEnd} />
          )
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
        ) : null}
      </Panel>
    </>
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
});

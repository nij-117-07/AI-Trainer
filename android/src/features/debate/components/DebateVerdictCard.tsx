// src/features/debate/components/DebateVerdictCard.tsx
/** The judge's verdict: winner, both scores, the strongest and weakest points, and the reasoning. */
import { StyleSheet, Text, View } from "react-native";
import { ThumbsDown, ThumbsUp, Trophy, type LucideIcon, Scale } from "lucide-react-native";
import { radius, spacing, useThemeColors } from "@/theme";
import { Panel } from "@/components/tool/FormControls";
import { ResultCallout } from "@/components/tool/ResultCallout";
import { SectionTitle } from "@/components/tool/SectionTitle";
import type { ArgumentPoint, JudgeVerdict } from "../types";

export function DebateVerdictCard({ verdict }: { verdict: JudgeVerdict }) {
  const colors = useThemeColors();
  const winnerLabel = verdict.winner === "tie" ? "Tie" : verdict.winner === "pro" ? "Pro wins" : "Con wins";
  return (
    <Panel>
      <View style={styles.row}>
        <SectionTitle icon={Trophy} title={winnerLabel} />
        <Text style={[styles.score, { color: colors.foreground }]}>
          Pro {verdict.proScore} – {verdict.conScore} Con
        </Text>
      </View>
      <PointRow icon={ThumbsUp} label="Strongest argument" point={verdict.strongestArgument} />
      <PointRow icon={ThumbsDown} label="Weakest argument" point={verdict.weakestArgument} />
      <ResultCallout icon={Scale} title="Reasoning" tone="sky">
        <Text style={[styles.body, { color: colors.foreground }]}>{verdict.reasoning}</Text>
      </ResultCallout>
      <Text style={[styles.body, { color: colors.mutedForeground }]}>{verdict.judgeComments}</Text>
    </Panel>
  );
}

function PointRow({ icon: Icon, label, point }: { icon: LucideIcon; label: string; point: ArgumentPoint }) {
  const colors = useThemeColors();
  return (
    <View style={styles.point}>
      <Icon size={16} color={colors.mutedForeground} />
      <View style={styles.pointBody}>
        <Text style={[styles.label, { color: colors.mutedForeground }]}>{label}</Text>
        <Text style={[styles.body, { color: colors.foreground }]}>
          <Text style={styles.bold}>{point.side === "pro" ? "Pro" : "Con"}: </Text>
          {point.claim}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    flexWrap: "wrap",
    gap: spacing.sm,
  },
  score: {
    fontSize: 15,
    fontWeight: "600",
  },
  point: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: spacing.sm,
    borderRadius: radius.lg,
  },
  pointBody: {
    flex: 1,
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
  bold: {
    fontWeight: "600",
  },
});

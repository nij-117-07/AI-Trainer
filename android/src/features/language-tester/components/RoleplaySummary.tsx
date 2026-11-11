// src/features/language-tester/components/RoleplaySummary.tsx
/** End-of-roleplay card: what went well and what to improve. Shown once the partner marks the goal as reached. */
import { StyleSheet, Text, View } from "react-native";
import { CircleCheck, Target } from "lucide-react-native";
import { Panel } from "@/components/tool/FormControls";
import { MarkdownText } from "@/components/tool/MarkdownText";
import { ResultCallout } from "@/components/tool/ResultCallout";
import { spacing, typeScale, useThemeColors } from "@/theme";
import type { ChatTurn, RoleplayFeedback } from "../types";

export function latestFeedback(turns: ChatTurn[]): RoleplayFeedback | null {
  for (let index = turns.length - 1; index >= 0; index -= 1) {
    const turn = turns[index];
    if (turn.role === "assistant" && turn.feedback) return turn.feedback;
  }
  return null;
}

export function RoleplaySummary({ turns }: { turns: ChatTurn[] }) {
  const colors = useThemeColors();
  const lines = turns.filter((turn) => turn.role === "user").length;
  const scores = turns.flatMap((turn) => (turn.feedback?.fluencyScore == null ? [] : [turn.feedback.fluencyScore]));
  const average = scores.length > 0 ? Math.round(scores.reduce((sum, score) => sum + score, 0) / scores.length) : null;
  const improve = latestFeedback(turns)?.suggestedStrategies ?? [];

  const wentWell = [`Goal reached in ${lines} ${lines === 1 ? "line" : "lines"}.`];
  if (average !== null) wentWell.push(`Average fluency ${average}/10.`);

  return (
    <Panel>
      <View style={styles.header}>
        <CircleCheck size={20} color={colors.tone.emerald.fg} />
        <Text accessibilityRole="header" style={[typeScale.title, { color: colors.foreground }]}>
          Roleplay complete
        </Text>
      </View>
      <ResultCallout icon={CircleCheck} title="What went well" tone="emerald">
        {wentWell.map((line) => (
          <Text key={line} style={[typeScale.body, { color: colors.foreground }]}>
            {line}
          </Text>
        ))}
      </ResultCallout>
      <ResultCallout icon={Target} title="To improve" tone="amber">
        {improve.length > 0 ? (
          <MarkdownText content={improve.map((strategy) => `- ${strategy}`).join("\n")} />
        ) : (
          <Text style={[typeScale.body, { color: colors.foreground }]}>No changes suggested.</Text>
        )}
      </ResultCallout>
    </Panel>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
});

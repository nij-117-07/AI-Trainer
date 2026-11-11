// src/features/clarity-trainer/components/ScenarioPanel.tsx
/** The active scenario and its prompt. The reply box lives in the page footer. */
import { StyleSheet, Text, View } from "react-native";
import { Clock, MessageSquareText } from "lucide-react-native";
import { shape, spacing, typeScale, useThemeColors } from "@/theme";
import { Panel } from "@/components/tool/FormControls";
import { ListenButton } from "@/components/tool/ListenButton";
import { MarkdownText } from "@/components/tool/MarkdownText";
import { ResultCallout } from "@/components/tool/ResultCallout";
import { SectionTitle } from "@/components/tool/SectionTitle";
import { textList, textOf } from "../lib/text";
import type { ClarityRound } from "../types";

interface ScenarioPanelProps {
  round: ClarityRound;
}

export function ScenarioPanel({ round }: ScenarioPanelProps) {
  const colors = useThemeColors();
  const { scenario } = round;
  const characters = textList(scenario.characters);
  const constraints = textList(scenario.constraints);

  return (
    <Panel>
      <View style={styles.header}>
        <View style={styles.title}>
          <SectionTitle icon={MessageSquareText} title={textOf(scenario.title) || "Scenario"} />
        </View>
        <View style={[styles.pill, { borderColor: colors.border }]}>
          <Clock size={12} color={colors.mutedForeground} />
          <Text style={[styles.pillText, { color: colors.mutedForeground }]}>~{scenario.idealLengthSeconds}s</Text>
        </View>
      </View>

      <Text style={[styles.body, { color: colors.mutedForeground }]}>{scenario.situation}</Text>
      <ListenButton text={scenario.situation} label="Scenario" />
      {characters.length > 0 && (
        <Text style={[styles.body, { color: colors.foreground }]}>
          <Text style={styles.bold}>Characters: </Text>
          {characters.join(", ")}
        </Text>
      )}
      <Text style={[styles.body, { color: colors.foreground }]}>
        <Text style={styles.bold}>Your goal: </Text>
        {scenario.goal}
      </Text>
      {constraints.length > 0 && <MarkdownText content={constraints.map((item) => `- ${item}`).join("\n")} />}

      <ResultCallout icon={MessageSquareText} title="Your prompt" tone="sky">
        <Text style={[styles.body, { color: colors.foreground }]}>{scenario.promptToUser}</Text>
        <ListenButton text={scenario.promptToUser} label="Prompt" />
      </ResultCallout>
    </Panel>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing.sm,
  },
  title: {
    flexShrink: 1,
  },
  pill: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    borderWidth: 1,
    borderRadius: shape.full,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  pillText: {
    ...typeScale.caption,
  },
  body: {
    ...typeScale.body,
  },
  bold: {
    fontWeight: "600",
  },
});

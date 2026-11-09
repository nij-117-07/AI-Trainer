// src/features/clarity-trainer/components/ScenarioPanel.tsx
/** The active scenario and the reply box. The reply box hides once the reply has been reviewed. */
import { StyleSheet, Text, View } from "react-native";
import { BadgeCheck, Clock, MessageSquareText } from "lucide-react-native";
import { radius, spacing, useThemeColors } from "@/theme";
import { ActionButton, ErrorText, Panel, TextField } from "@/components/tool/FormControls";
import { ListenButton } from "@/components/tool/ListenButton";
import { MarkdownText } from "@/components/tool/MarkdownText";
import { ResultCallout } from "@/components/tool/ResultCallout";
import { SectionTitle } from "@/components/tool/SectionTitle";
import { LIMITS } from "../options";
import { textList, textOf } from "../lib/text";
import type { ClarityRound } from "../types";

interface ScenarioPanelProps {
  round: ClarityRound;
  pending: boolean;
  error: string | null;
  onResponseChange: (text: string) => void;
  onEvaluate: () => void;
}

export function ScenarioPanel({ round, pending, error, onResponseChange, onEvaluate }: ScenarioPanelProps) {
  const colors = useThemeColors();
  const { scenario, response, evaluation } = round;
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

      {!evaluation && (
        <>
          <TextField
            label="Your response"
            placeholder="Write your response…"
            value={response}
            onChangeText={onResponseChange}
            editable={!pending}
            maxLength={LIMITS.response}
            multiline
            voice
          />
          <ErrorText message={error} />
          <ActionButton
            label={pending ? "Analyzing response…" : "Evaluate my response"}
            icon={BadgeCheck}
            loading={pending}
            onPress={onEvaluate}
          />
        </>
      )}
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
    borderRadius: radius.full,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  pillText: {
    fontSize: 12,
    fontWeight: "500",
  },
  body: {
    fontSize: 15,
    lineHeight: 22,
  },
  bold: {
    fontWeight: "600",
  },
});

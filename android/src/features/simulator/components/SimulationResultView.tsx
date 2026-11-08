// src/features/simulator/components/SimulationResultView.tsx
/** The run output as one Markdown document: inner thought, chosen action, spoken reply, and mood. */
import { StyleSheet, Text } from "react-native";
import { spacing, useThemeColors } from "@/theme";
import { Panel } from "@/components/tool/FormControls";
import { MarkdownText } from "@/components/tool/MarkdownText";
import type { SimulationResult } from "../types";

export function SimulationResultView({ result }: { result: SimulationResult }) {
  const colors = useThemeColors();
  const sections = [
    result.thoughtProcess && `## Inner Thought\n\n${result.thoughtProcess}`,
    result.chosenAction && `## Chosen Action\n\n${result.chosenAction}`,
    result.responseDialogue && `## The Persona Responds\n\n> ${result.responseDialogue}`,
    result.emotionalState && `## Emotional State\n\n${result.emotionalState}`,
  ].filter(Boolean);

  return (
    <Panel>
      <MarkdownText content={sections.join("\n\n")} />
      {result.simulationId ? (
        <Text style={[styles.footer, { color: colors.mutedForeground, borderTopColor: colors.border }]}>
          Simulation ID: {result.simulationId}
        </Text>
      ) : null}
    </Panel>
  );
}

const styles = StyleSheet.create({
  footer: {
    fontSize: 12,
    paddingTop: spacing.md,
    borderTopWidth: 1,
  },
});

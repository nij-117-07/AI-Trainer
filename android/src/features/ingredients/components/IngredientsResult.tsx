// src/features/ingredients/components/IngredientsResult.tsx
/**
 * Ingredients Checker output: a tinted health-level callout, the detected ingredients as chips,
 * the risk factors, and the analysis summary.
 */
import { StyleSheet, Text } from "react-native";
import { FileText, Gauge, ShieldAlert } from "lucide-react-native";
import { spacing, useThemeColors } from "@/theme";
import { Panel } from "@/components/tool/FormControls";
import { MarkdownText } from "@/components/tool/MarkdownText";
import { ResultCallout } from "@/components/tool/ResultCallout";
import { SectionTitle } from "@/components/tool/SectionTitle";
import { TagList } from "@/components/tool/TagList";
import { HEALTH_LEVEL_INFO } from "../options";
import type { IngredientAnalysis } from "../types";

export function IngredientsResult({ result }: { result: IngredientAnalysis }) {
  const colors = useThemeColors();
  const level = HEALTH_LEVEL_INFO[result.healthLevel];

  return (
    <>
      <ResultCallout icon={Gauge} title={`Health level ${level.label}`} tone={level.tone}>
        <Text style={[styles.levelText, { color: colors.foreground }]}>{level.description}</Text>
      </ResultCallout>

      <Panel>
        <SectionTitle icon={FileText} title="Detected ingredients" />
        {result.extractedIngredients.length > 0 ? (
          <TagList items={result.extractedIngredients} />
        ) : (
          <Text style={[styles.empty, { color: colors.mutedForeground }]}>No ingredients detected.</Text>
        )}
      </Panel>

      {result.riskFactors.length > 0 && (
        <Panel>
          <SectionTitle icon={ShieldAlert} title="Risk factors" />
          <MarkdownText content={result.riskFactors.map((risk) => `- ${risk}`).join("\n")} />
        </Panel>
      )}

      <Panel>
        <SectionTitle icon={FileText} title="Analysis" />
        <MarkdownText content={result.summaryAnalysis} />
      </Panel>
    </>
  );
}

const styles = StyleSheet.create({
  levelText: {
    fontSize: 15,
    lineHeight: 22,
    marginTop: spacing.xs,
  },
  empty: {
    fontSize: 14,
    lineHeight: 20,
  },
});

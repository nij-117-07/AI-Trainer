// src/features/bias-inoculator/components/BiasResult.tsx
/**
 * The generated training scenario: the bias being trained against, the stealthy setup, the
 * intuitive trap, the rational analysis, and a real-world tip.
 */
import { StyleSheet, Text, View } from "react-native";
import { Compass, Scale, ShieldExclamationPoint, Zap, type LucideIcon } from "lucide-react-native";
import { spacing, useThemeColors } from "@/theme";
import { Panel } from "@/components/tool/FormControls";
import { ListenButton } from "@/components/tool/ListenButton";
import { MarkdownText } from "@/components/tool/MarkdownText";
import { ResultCallout } from "@/components/tool/ResultCallout";
import { SectionTitle } from "@/components/tool/SectionTitle";
import { TARGET_BIAS_OPTIONS } from "../options";
import type { BiasScenario } from "../types";

export function BiasResult({ result }: { result: BiasScenario }) {
  const colors = useThemeColors();
  const label = TARGET_BIAS_OPTIONS.find((option) => option.value === result.targetBias)?.label ?? result.targetBias;
  return (
    <View style={styles.stack}>
      <ResultCallout icon={ShieldExclamationPoint} title={`Training against: ${label}`} tone="amber">
        <Text style={[styles.hint, { color: colors.foreground }]}>
          Commit to your gut answer before reading the trap and the analysis.
        </Text>
      </ResultCallout>
      <BiasSection icon={ShieldExclamationPoint} title="Scenario Setup" content={result.scenarioSetup} />
      <BiasSection icon={Zap} title="The Intuitive Trap" content={result.intuitiveTrap} />
      <BiasSection icon={Scale} title="Rational Analysis" content={result.rationalAnalysis} />
      <BiasSection icon={Compass} title="Real-World Application" content={result.realWorldApplication} />
    </View>
  );
}

function BiasSection({ icon, title, content }: { icon: LucideIcon; title: string; content: string }) {
  return (
    <Panel>
      <SectionTitle icon={icon} title={title} />
      {content === "" ? <MarkdownText content="Nothing was returned." /> : <MarkdownText content={content} />}
      <ListenButton text={content} label={title} />
    </Panel>
  );
}

const styles = StyleSheet.create({
  stack: {
    gap: spacing.lg,
  },
  hint: {
    fontSize: 14,
    lineHeight: 20,
  },
});

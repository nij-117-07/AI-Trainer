/**
 * The generated training scenario. The setup shows at once. The intuitive trap, the rational
 * analysis, and the real-world tip stay behind a reveal, so the user can commit to an answer first.
 */
import { useEffect, useState } from "react";
import { StyleSheet, View } from "react-native";
import { Compass, Scale, ShieldExclamationPoint, Zap, type LucideIcon } from "lucide-react-native";
import { spacing } from "@/theme";
import { Panel } from "@/components/tool/FormControls";
import { Disclosure } from "@/components/tool/Disclosure";
import { ListenButton } from "@/components/tool/ListenButton";
import { MarkdownText } from "@/components/tool/MarkdownText";
import { SectionTitle } from "@/components/tool/SectionTitle";
import { TARGET_BIAS_OPTIONS } from "../options";
import type { BiasScenario } from "../types";

export function BiasResult({ result }: { result: BiasScenario }) {
  const label = TARGET_BIAS_OPTIONS.find((option) => option.value === result.targetBias)?.label ?? result.targetBias;
  const [revealed, setRevealed] = useState(false);

  useEffect(() => {
    setRevealed(false);
  }, [result]);

  return (
    <View style={styles.stack}>
      <Panel>
        <SectionTitle icon={ShieldExclamationPoint} title={`Training against: ${label}`} />
        <MarkdownText content={result.scenarioSetup === "" ? "Nothing was returned." : result.scenarioSetup} />
        <ListenButton text={result.scenarioSetup} label="scenario setup" />
      </Panel>
      <Disclosure
        title={revealed ? "Hide the trap and analysis" : "Reveal the trap and analysis"}
        summary="Commit to your own answer first."
        open={revealed}
        onToggle={setRevealed}
      >
        <BiasSection icon={Zap} title="Intuitive trap" content={result.intuitiveTrap} />
        <BiasSection icon={Scale} title="Rational analysis" content={result.rationalAnalysis} />
        <BiasSection icon={Compass} title="Real-world application" content={result.realWorldApplication} />
      </Disclosure>
    </View>
  );
}

function BiasSection({ icon, title, content }: { icon: LucideIcon; title: string; content: string }) {
  return (
    <View style={styles.section}>
      <SectionTitle icon={icon} title={title} />
      <MarkdownText content={content === "" ? "Nothing was returned." : content} />
      <ListenButton text={content} label={title} />
    </View>
  );
}

const styles = StyleSheet.create({
  stack: {
    gap: spacing.lg,
  },
  section: {
    gap: spacing.md,
  },
});

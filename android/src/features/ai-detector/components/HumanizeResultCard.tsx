// src/features/ai-detector/components/HumanizeResultCard.tsx
/** Humanize result: the rewritten text, the pass-as-human confidence, and the changes made. */
import type { ReactNode } from "react";
import { StyleSheet, Text, View } from "react-native";
import { ListChecks, Sparkles } from "lucide-react-native";
import { radius, spacing, useThemeColors } from "@/theme";
import { Panel } from "@/components/tool/FormControls";
import { ListenButton } from "@/components/tool/ListenButton";
import { SectionTitle } from "@/components/tool/SectionTitle";
import { confidenceTone } from "../lib/analysis";
import type { HumanizedText } from "../types";
import { BulletList } from "./BulletList";
import { ScoreBar } from "./ScoreBar";

interface HumanizeResultCardProps {
  result: HumanizedText;
  children?: ReactNode;
}

export function HumanizeResultCard({ result, children }: HumanizeResultCardProps) {
  const colors = useThemeColors();
  return (
    <Panel>
      <SectionTitle icon={Sparkles} title="Humanized text" />

      <View style={[styles.rewrite, { backgroundColor: colors.muted }]}>
        <Text selectable style={[styles.rewriteText, { color: colors.foreground }]}>
          {result.humanizedText}
        </Text>
      </View>
      <ListenButton text={result.humanizedText} label="Humanized text" />

      <ScoreBar
        value={result.confidence}
        label="Pass-as-human confidence"
        caption="How confident the model is that this reads as human-written."
        tone={confidenceTone(result.confidence)}
      />

      <BulletList icon={ListChecks} title="Changes made" tone="emerald" items={result.changesMade} />

      {children}
    </Panel>
  );
}

const styles = StyleSheet.create({
  rewrite: {
    borderRadius: radius.lg,
    padding: spacing.md,
  },
  rewriteText: {
    fontSize: 15,
    lineHeight: 23,
  },
});

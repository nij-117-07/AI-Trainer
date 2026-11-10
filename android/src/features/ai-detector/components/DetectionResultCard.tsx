// src/features/ai-detector/components/DetectionResultCard.tsx
/** Detection result: AI likelihood meter, verdict badge, reason, flagged patterns, and suggestions. */
import { StyleSheet, Text, View } from "react-native";
import { Flag, Lightbulb } from "lucide-react-native";
import { radius, spacing, useThemeColors } from "@/theme";
import { ListenButton } from "@/components/tool/ListenButton";
import { Panel } from "@/components/tool/FormControls";
import { riskTone, verdictTone } from "../lib/analysis";
import type { AiDetection } from "../types";
import { BulletList } from "./BulletList";
import { ScoreBar } from "./ScoreBar";

export function DetectionResultCard({ result }: { result: AiDetection }) {
  const colors = useThemeColors();
  const verdict = verdictTone(result.verdict);
  const palette = colors.tone[verdict];

  return (
    <Panel>
      <View style={styles.header}>
        <Text style={[styles.heading, { color: colors.foreground }]}>Detection result</Text>
        <View style={[styles.badge, { backgroundColor: palette.bg, borderColor: palette.border }]}>
          <Text style={[styles.badgeText, { color: palette.fg }]}>{result.verdict}</Text>
        </View>
      </View>

      <ScoreBar
        value={result.aiScore}
        label="AI likelihood"
        caption="Higher means the text is more likely to have been written by AI."
        tone={riskTone(result.aiScore)}
      />

      {result.reason !== "" && (
        <>
          <Text style={[styles.reason, { color: colors.foreground }]}>{result.reason}</Text>
          <ListenButton text={result.reason} label="Reason" />
        </>
      )}

      <BulletList icon={Flag} title="Flagged patterns" tone="amber" items={result.flaggedPatterns} />
      <BulletList icon={Lightbulb} title="Suggested changes" tone="sky" items={result.suggestedChanges} />
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
  heading: {
    fontSize: 16,
    fontWeight: "600",
  },
  badge: {
    borderWidth: 1,
    borderRadius: radius.full,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
  },
  badgeText: {
    fontSize: 13,
    fontWeight: "600",
  },
  reason: {
    fontSize: 14,
    lineHeight: 21,
  },
});

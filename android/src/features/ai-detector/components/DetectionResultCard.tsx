// src/features/ai-detector/components/DetectionResultCard.tsx
/** Detection result: verdict, AI likelihood, and reason first; flagged patterns and suggestions behind disclosure. */
import { StyleSheet, Text, View } from "react-native";
import { Bot, Flag, Lightbulb, Scale, User, type LucideIcon } from "lucide-react-native";
import { shape, spacing, typeScale, useThemeColors } from "@/theme";
import { ListenButton } from "@/components/tool/ListenButton";
import { Disclosure } from "@/components/tool/Disclosure";
import { Panel } from "@/components/tool/FormControls";
import { riskTone, verdictTone } from "../lib/analysis";
import type { AiDetection, Verdict } from "../types";
import { BulletList } from "./BulletList";
import { ScoreBar } from "./ScoreBar";

const VERDICT_ICON: Record<Verdict, LucideIcon> = {
  "Likely AI": Bot,
  "Likely Human": User,
  Mixed: Scale,
};

function countLabel(count: number, noun: string): string {
  return `${count} ${count === 1 ? noun : `${noun}s`}`;
}

export function DetectionResultCard({ result }: { result: AiDetection }) {
  const colors = useThemeColors();
  const verdict = verdictTone(result.verdict);
  const palette = colors.tone[verdict];
  const VerdictIcon = VERDICT_ICON[result.verdict];

  return (
    <>
      <Panel>
        <View style={styles.header}>
          <Text accessibilityRole="header" style={[styles.heading, { color: colors.foreground }]}>
            Detection result
          </Text>
          <View style={[styles.badge, { backgroundColor: palette.bg, borderColor: palette.border }]}>
            <VerdictIcon size={14} color={palette.fg} />
            <Text accessibilityLiveRegion="polite" style={[styles.badgeText, { color: palette.fg }]}>
              {result.verdict}
            </Text>
          </View>
        </View>

        <ScoreBar value={result.aiScore} label="AI likelihood" tone={riskTone(result.aiScore)} />

        {result.reason !== "" && (
          <>
            <Text style={[styles.reason, { color: colors.foreground }]}>{result.reason}</Text>
            <ListenButton text={result.reason} label="Reason" />
          </>
        )}
      </Panel>

      {result.flaggedPatterns.length > 0 && (
        <Disclosure
          title="Flagged patterns"
          icon={Flag}
          summary={countLabel(result.flaggedPatterns.length, "pattern")}
        >
          <BulletList tone="amber" items={result.flaggedPatterns} />
        </Disclosure>
      )}
      {result.suggestedChanges.length > 0 && (
        <Disclosure
          title="Suggested changes"
          icon={Lightbulb}
          summary={countLabel(result.suggestedChanges.length, "change")}
        >
          <BulletList tone="sky" items={result.suggestedChanges} />
        </Disclosure>
      )}
    </>
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
    ...typeScale.title,
  },
  badge: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    borderWidth: 1,
    borderRadius: shape.full,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
  },
  badgeText: {
    ...typeScale.caption,
    fontWeight: "600",
  },
  reason: {
    ...typeScale.body,
  },
});

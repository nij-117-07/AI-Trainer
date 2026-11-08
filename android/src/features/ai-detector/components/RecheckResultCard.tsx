// src/features/ai-detector/components/RecheckResultCard.tsx
/** Re-detect result: compares the new score with the original, then shows the full detection. */
import { StyleSheet, Text } from "react-native";
import { Minus, Sparkles, TrendingDown, TrendingUp } from "lucide-react-native";
import { useThemeColors } from "@/theme";
import { ActionButton } from "@/components/tool/FormControls";
import { ResultCallout } from "@/components/tool/ResultCallout";
import { scoreDeltaPoints } from "../lib/analysis";
import type { AiDetection } from "../types";
import { DetectionResultCard } from "./DetectionResultCard";

interface RecheckResultCardProps {
  result: AiDetection;
  original: AiDetection | null;
  onHumanizeAgain: () => void;
}

export function RecheckResultCard({ result, original, onHumanizeAgain }: RecheckResultCardProps) {
  const colors = useThemeColors();
  const delta = scoreDeltaPoints(original, result);
  const bodyStyle = [styles.body, { color: colors.foreground }];

  return (
    <>
      {delta !== null && delta < 0 && (
        <ResultCallout icon={TrendingDown} title={`AI score dropped ${Math.abs(delta)} points`} tone="emerald">
          <Text style={bodyStyle}>The humanized version scored lower than the original. It reads more human now.</Text>
        </ResultCallout>
      )}
      {delta !== null && delta > 0 && (
        <ResultCallout icon={TrendingUp} title={`AI score rose ${delta} points`} tone="amber">
          <Text style={bodyStyle}>
            The rewrite scored higher than the original. Consider humanizing again with stricter feedback.
          </Text>
        </ResultCallout>
      )}
      {delta !== null && delta === 0 && (
        <ResultCallout icon={Minus} title="Score unchanged" tone="sky">
          <Text style={bodyStyle}>The AI likelihood stayed the same. Try a different tone or add extra instructions.</Text>
        </ResultCallout>
      )}

      <DetectionResultCard result={result}>
        <ActionButton label="Humanize again" icon={Sparkles} variant="outline" onPress={onHumanizeAgain} />
      </DetectionResultCard>
    </>
  );
}

const styles = StyleSheet.create({
  body: {
    fontSize: 14,
    lineHeight: 20,
  },
});

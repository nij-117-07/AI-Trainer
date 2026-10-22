// src/features/tools/ai-detector/components/results/RecheckResultCard.tsx
/**
 * Final-step result: compares the re-detection score against the original
 * detection, then reuses DetectionResultCard for the details. Exposes the
 * "Humanize again" and "Start over" buttons.
 */
"use client";

import { Minus, RotateCcw, TrendingDown, TrendingUp, Wand2 } from "lucide-react";
import { ResultCallout } from "@/features/learning/explainer/components/ResultCallout";
import { scoreDeltaPoints, type AIDetectionResponse } from "../../types";
import { DetectionResultCard } from "./DetectionResultCard";
import { ResultCtaRow } from "./ResultCtaRow";
import { AdvanceButton } from "./AdvanceButton";

interface RecheckResultCardProps {
  result: AIDetectionResponse;
  original: AIDetectionResponse | null;
  onHumanizeAgain: () => void;
  onStartOver: () => void;
}

function DeltaCallout({ delta }: { delta: number | null }) {
  if (delta === null) return null;
  if (delta < 0) {
    return (
      <ResultCallout icon={TrendingDown} tone="success" title={`AI score dropped ${Math.abs(delta)} points`}>
        The humanized version scored lower than the original — it reads more human now.
      </ResultCallout>
    );
  }
  if (delta > 0) {
    return (
      <ResultCallout icon={TrendingUp} tone="warn" title={`AI score rose ${delta} points`}>
        The rewrite scored higher than the original — consider humanizing again with stricter feedback.
      </ResultCallout>
    );
  }
  return (
    <ResultCallout icon={Minus} tone="info" title="Score unchanged">
      The AI likelihood stayed the same. Try a different tone or add extra instructions.
    </ResultCallout>
  );
}

export function RecheckResultCard({
  result,
  original,
  onHumanizeAgain,
  onStartOver,
}: RecheckResultCardProps) {
  return (
    <div className="space-y-4">
      <DeltaCallout delta={scoreDeltaPoints(original, result)} />
      <DetectionResultCard result={result}>
        <ResultCtaRow>
          <AdvanceButton icon={Wand2} onClick={onHumanizeAgain} variant="outline">
            Humanize again
          </AdvanceButton>
          <AdvanceButton icon={RotateCcw} onClick={onStartOver} variant="ghost">
            Start over
          </AdvanceButton>
        </ResultCtaRow>
      </DetectionResultCard>
    </div>
  );
}

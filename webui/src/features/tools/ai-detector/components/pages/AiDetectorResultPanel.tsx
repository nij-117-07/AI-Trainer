// src/features/tools/ai-detector/components/pages/AiDetectorResultPanel.tsx
/**
 * Routes the right-hand result panel by wizard step. Each result card is
 * rendered with the explicit button that unlocks the next step; empty states
 * tell users which button to press.
 */
"use client";

import { ArrowRight, ScanSearch, Wand2 } from "lucide-react";
import { EmptyResult } from "@/features/learning/explainer/components/EmptyResult";
import type { AiDetectorWizard } from "../../hooks/useAiDetectorWizard";
import { AdvanceButton } from "../results/AdvanceButton";
import { DetectionResultCard } from "../results/DetectionResultCard";
import { HumanizeResultCard } from "../results/HumanizeResultCard";
import { RecheckResultCard } from "../results/RecheckResultCard";
import { ResultCtaRow } from "../results/ResultCtaRow";

export function AiDetectorResultPanel({ wizard }: { wizard: AiDetectorWizard }) {
  const { step, draft } = wizard;

  if (step === "humanize") {
    if (!draft.humanize) {
      return (
        <EmptyResult
          icon={Wand2}
          title="No rewrite yet"
          description='Click "Humanize text" in the form — the rewritten passage appears here.'
        />
      );
    }
    return (
      <HumanizeResultCard result={draft.humanize}>
        <ResultCtaRow>
          <AdvanceButton icon={ArrowRight} onClick={wizard.advanceToRecheck}>
            Re-detect this text
          </AdvanceButton>
        </ResultCtaRow>
      </HumanizeResultCard>
    );
  }

  if (step === "recheck") {
    if (!draft.recheck) {
      return (
        <EmptyResult
          icon={ScanSearch}
          title="Not re-checked yet"
          description='Click "Re-detect" to scan the humanized text and compare it with the original score.'
        />
      );
    }
    return (
      <RecheckResultCard
        result={draft.recheck}
        original={draft.detect}
        onHumanizeAgain={wizard.humanizeAgain}
        onStartOver={wizard.startOver}
      />
    );
  }

  if (!draft.detect) {
    return (
      <EmptyResult
        icon={ScanSearch}
        title="No analysis yet"
        description='Paste your text and click "Detect AI content" to get the AI score, verdict, and flagged patterns.'
      />
    );
  }

  return (
    <DetectionResultCard result={draft.detect}>
      <ResultCtaRow>
        <AdvanceButton icon={ArrowRight} onClick={wizard.advanceToHumanize}>
          Continue to Humanize
        </AdvanceButton>
      </ResultCtaRow>
    </DetectionResultCard>
  );
}

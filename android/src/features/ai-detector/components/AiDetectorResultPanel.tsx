// src/features/ai-detector/components/AiDetectorResultPanel.tsx
/** Shows the result for the active step. Each result carries the button that unlocks the next step. */
import { ArrowRight, Sparkles, ShieldCheck, RefreshCcw } from "lucide-react-native";
import { ActionButton } from "@/components/tool/FormControls";
import type { AiDetectorWizard } from "../hooks/useAiDetectorWizard";
import { DetectionResultCard } from "./DetectionResultCard";
import { EmptyResult } from "./EmptyResult";
import { HumanizeResultCard } from "./HumanizeResultCard";
import { RecheckResultCard } from "./RecheckResultCard";

export function AiDetectorResultPanel({ wizard }: { wizard: AiDetectorWizard }) {
  const { step, draft } = wizard;

  if (step === "humanize") {
    if (!draft.humanize) {
      return (
        <EmptyResult
          icon={Sparkles}
          title="No rewrite yet"
          description='Tap "Humanize text" in the form. The rewritten passage appears here.'
        />
      );
    }
    return (
      <HumanizeResultCard result={draft.humanize}>
        <ActionButton label="Re-detect this text" icon={ArrowRight} onPress={wizard.advanceToRecheck} />
      </HumanizeResultCard>
    );
  }

  if (step === "recheck") {
    if (!draft.recheck) {
      return (
        <EmptyResult
          icon={RefreshCcw}
          title="Not re-checked yet"
          description='Tap "Re-detect" to scan the humanized text and compare it with the original score.'
        />
      );
    }
    return (
      <RecheckResultCard result={draft.recheck} original={draft.detect} onHumanizeAgain={wizard.humanizeAgain} />
    );
  }

  if (!draft.detect) {
    return (
      <EmptyResult
        icon={ShieldCheck}
        title="No analysis yet"
        description='Paste your text and tap "Detect AI content" to get the AI score, verdict, and flagged patterns.'
      />
    );
  }

  return (
    <DetectionResultCard result={draft.detect}>
      <ActionButton label="Continue to Humanize" icon={ArrowRight} onPress={wizard.advanceToHumanize} />
    </DetectionResultCard>
  );
}

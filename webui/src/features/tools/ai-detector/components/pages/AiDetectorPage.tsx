// src/features/tools/ai-detector/components/pages/AiDetectorPage.tsx
/**
 * AI Detector tool page: a gated 3-step wizard (Detect → Humanize → Re-detect).
 * Renders the step indicator plus only the active step's form on the left and
 * routes results on the right; every transition requires an explicit click.
 */
"use client";

import { ExplainerPageShell } from "@/features/learning/explainer/components/ExplainerPageShell";
import { DraftStatus } from "@/features/learning/explainer/components/DraftStatus";
import { LockedStepGuard } from "../LockedStepGuard";
import { StepIndicator } from "../StepIndicator";
import { useAiDetectorWizard } from "../../hooks/useAiDetectorWizard";
import { DetectStepForm } from "../steps/DetectStepForm";
import { HumanizeStepForm } from "../steps/HumanizeStepForm";
import { RecheckStepForm } from "../steps/RecheckStepForm";
import { AiDetectorResultPanel } from "./AiDetectorResultPanel";

export function AiDetectorPage() {
  const wizard = useAiDetectorWizard();
  const { step, draft, hydrated } = wizard;

  return (
    <ExplainerPageShell
      title="AI Detector"
      description="Scan writing for AI patterns, humanize it, then re-detect to verify — each step only runs when you press its button."
      headerAction={
        <DraftStatus
          status={wizard.persistStatus}
          onReset={wizard.startOver}
          onClear={wizard.startOver}
          disabled={wizard.isBusy}
        />
      }
      form={
        <div className="space-y-4">
          <StepIndicator
            step={step}
            canHumanize={wizard.canHumanize}
            canRecheck={wizard.canRecheck}
            isBusy={wizard.isBusy}
          />

          {step === "detect" && (
            <DetectStepForm
              key={hydrated ? "detect-ready" : "detect-pending"}
              defaultText={draft.originalText}
              isPending={wizard.detect.isPending}
              error={wizard.detect.error}
              onSubmit={wizard.detect.submit}
            />
          )}

          {step === "humanize" &&
            (wizard.canHumanize ? (
              <HumanizeStepForm
                aiTextPrefill={wizard.humanizeTextPrefill}
                feedbackPrefill={wizard.feedbackPrefill}
                isPending={wizard.humanize.isPending}
                error={wizard.humanize.error}
                onSubmit={wizard.humanize.submit}
              />
            ) : (
              <LockedStepGuard
                title="Humanize is locked"
                description='Run the detect step first, then click "Continue to Humanize" on its result.'
                onBack={wizard.goToDetect}
              />
            ))}

          {step === "recheck" &&
            (wizard.canRecheck ? (
              <RecheckStepForm
                textPrefill={wizard.recheckTextPrefill}
                isPending={wizard.recheck.isPending}
                error={wizard.recheck.error}
                onSubmit={wizard.recheck.submit}
              />
            ) : (
              <LockedStepGuard
                title="Re-detect is locked"
                description='Humanize the text first, then click "Re-detect this text" on its result.'
                onBack={wizard.goToDetect}
              />
            ))}
        </div>
      }
      result={<AiDetectorResultPanel wizard={wizard} />}
    />
  );
}

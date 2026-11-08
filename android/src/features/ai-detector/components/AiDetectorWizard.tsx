// src/features/ai-detector/components/AiDetectorWizard.tsx
/** AI Detector screen body: step indicator, the active step's form, its result, and Start over. */
import { ActivityIndicator } from "react-native";
import { RefreshCcw } from "lucide-react-native";
import { useThemeColors, spacing } from "@/theme";
import { Section } from "@/components/tool/Section";
import { ActionButton } from "@/components/tool/FormControls";
import { useAiDetectorWizard } from "../hooks/useAiDetectorWizard";
import { AiDetectorResultPanel } from "./AiDetectorResultPanel";
import { DetectStep } from "./DetectStep";
import { HumanizeStep } from "./HumanizeStep";
import { LockedStepGuard } from "./LockedStepGuard";
import { RecheckStep } from "./RecheckStep";
import { StepIndicator } from "./StepIndicator";

export function AiDetectorWizard() {
  const colors = useThemeColors();
  const wizard = useAiDetectorWizard();
  const { step, draft, loaded, isBusy } = wizard;

  if (!loaded) {
    return <ActivityIndicator color={colors.primary} style={{ marginTop: spacing["2xl"] }} />;
  }

  return (
    <Section>
      <StepIndicator step={step} canHumanize={wizard.canHumanize} canRecheck={wizard.canRecheck} />

      {step === "detect" && (
        <DetectStep
          defaultText={draft.originalText}
          isPending={wizard.detect.isPending}
          error={wizard.detect.error}
          onSubmit={wizard.detect.submit}
        />
      )}

      {step === "humanize" &&
        (wizard.canHumanize ? (
          <HumanizeStep
            aiTextPrefill={wizard.humanizeTextPrefill}
            feedbackPrefill={wizard.feedbackPrefill}
            isPending={wizard.humanize.isPending}
            error={wizard.humanize.error}
            onSubmit={wizard.humanize.submit}
          />
        ) : (
          <LockedStepGuard
            title="Humanize is locked"
            description='Run the detect step first, then tap "Continue to Humanize" on its result.'
            onBack={wizard.goToDetect}
          />
        ))}

      {step === "recheck" &&
        (wizard.canRecheck ? (
          <RecheckStep
            textPrefill={wizard.recheckTextPrefill}
            isPending={wizard.recheck.isPending}
            error={wizard.recheck.error}
            onSubmit={wizard.recheck.submit}
          />
        ) : (
          <LockedStepGuard
            title="Re-detect is locked"
            description='Humanize the text first, then tap "Re-detect this text" on its result.'
            onBack={wizard.goToDetect}
          />
        ))}

      <AiDetectorResultPanel wizard={wizard} />

      <ActionButton
        label={isBusy ? "Working…" : "Start over"}
        icon={RefreshCcw}
        variant="outline"
        onPress={wizard.startOver}
      />
    </Section>
  );
}

// src/features/ai-detector/components/HumanizeStep.tsx
/** Step 2 form: text to rewrite, target tone, and the editable detector feedback from step 1. */
import { useState } from "react";
import { Sparkles } from "lucide-react-native";
import { SelectField } from "@/components/tool/SelectField";
import { ActionButton, ErrorText, Panel, TextField } from "@/components/tool/FormControls";
import { DEFAULT_TONE, TONE_OPTIONS } from "../options";
import { COMMENTS_MAX, FEEDBACK_MAX, TEXT_MAX } from "../lib/validate";
import type { HumanizeFormValues } from "../types";

interface HumanizeStepProps {
  aiTextPrefill: string;
  feedbackPrefill: string;
  isPending: boolean;
  error: string | null;
  onSubmit: (values: HumanizeFormValues) => void;
}

export function HumanizeStep({ aiTextPrefill, feedbackPrefill, isPending, error, onSubmit }: HumanizeStepProps) {
  const [aiText, setAiText] = useState(aiTextPrefill);
  const [targetTone, setTargetTone] = useState(DEFAULT_TONE);
  const [detectionFeedback, setDetectionFeedback] = useState(feedbackPrefill);
  const [additionalComments, setAdditionalComments] = useState("");

  return (
    <>
      <Panel>
        <TextField
          label="Text to humanize"
          placeholder="The AI-sounding text to rewrite…"
          hint="Prefilled from your detect step — edit freely."
          value={aiText}
          onChangeText={setAiText}
          editable={!isPending}
          maxLength={TEXT_MAX}
          multiline
        />
        <SelectField
          label="Target tone"
          options={TONE_OPTIONS}
          value={targetTone}
          onChange={setTargetTone}
          allowCustom={false}
        />
        <TextField
          label="Detection feedback"
          placeholder="Flagged patterns and suggested changes…"
          hint="Prefilled from the detector — edit or trim as needed."
          value={detectionFeedback}
          onChangeText={setDetectionFeedback}
          editable={!isPending}
          maxLength={FEEDBACK_MAX}
          multiline
        />
        <TextField
          label="Extra instructions (optional)"
          placeholder="Audience, phrasing to preserve, length limits…"
          value={additionalComments}
          onChangeText={setAdditionalComments}
          editable={!isPending}
          maxLength={COMMENTS_MAX}
          multiline
        />
        <ActionButton
          label={isPending ? "Rewriting…" : "Humanize text"}
          icon={Sparkles}
          loading={isPending}
          onPress={() => onSubmit({ aiText, targetTone, detectionFeedback, additionalComments })}
        />
      </Panel>
      <ErrorText message={error} />
    </>
  );
}

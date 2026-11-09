// src/features/ai-detector/components/DetectStep.tsx
/** Step 1 form: the text to scan plus optional context. */
import { useState } from "react";
import { ShieldCheck } from "lucide-react-native";
import { ActionButton, ErrorText, Panel, TextField } from "@/components/tool/FormControls";
import { COMMENTS_MAX, TEXT_MAX } from "../lib/validate";
import type { DetectFormValues } from "../types";

interface DetectStepProps {
  defaultText: string;
  isPending: boolean;
  error: string | null;
  onSubmit: (values: DetectFormValues) => void;
}

export function DetectStep({ defaultText, isPending, error, onSubmit }: DetectStepProps) {
  const [textToCheck, setTextToCheck] = useState(defaultText);
  const [additionalComments, setAdditionalComments] = useState("");

  return (
    <>
      <Panel>
        <TextField
          label="Text to analyze"
          placeholder="Paste the paragraph, essay, or post you want scanned…"
          hint="Up to 50,000 characters. Everything stays on this device."
          value={textToCheck}
          onChangeText={setTextToCheck}
          editable={!isPending}
          maxLength={TEXT_MAX}
          multiline
          voice
        />
        <TextField
          label="Additional context (optional)"
          placeholder="Where the text came from, who wrote it, specific concerns…"
          value={additionalComments}
          onChangeText={setAdditionalComments}
          editable={!isPending}
          maxLength={COMMENTS_MAX}
          multiline
          voice
        />
        <ActionButton
          label={isPending ? "Analyzing…" : "Detect AI content"}
          icon={ShieldCheck}
          loading={isPending}
          onPress={() => onSubmit({ textToCheck, additionalComments })}
        />
      </Panel>
      <ErrorText message={error} />
    </>
  );
}

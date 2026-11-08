// src/features/ai-detector/components/RecheckStep.tsx
/** Step 3 form: runs detection on the humanized text so the rewrite can be verified. */
import { useState } from "react";
import { RefreshCcw } from "lucide-react-native";
import { ActionButton, ErrorText, Panel, TextField } from "@/components/tool/FormControls";
import { COMMENTS_MAX, TEXT_MAX } from "../lib/validate";
import type { DetectFormValues } from "../types";

interface RecheckStepProps {
  textPrefill: string;
  isPending: boolean;
  error: string | null;
  onSubmit: (values: DetectFormValues) => void;
}

export function RecheckStep({ textPrefill, isPending, error, onSubmit }: RecheckStepProps) {
  const [textToCheck, setTextToCheck] = useState(textPrefill);

  return (
    <>
      <Panel>
        <TextField
          label="Text to re-check"
          placeholder="The humanized text to analyze again…"
          hint="Prefilled with the humanized output — edit freely."
          value={textToCheck}
          onChangeText={setTextToCheck}
          editable={!isPending}
          maxLength={TEXT_MAX}
          multiline
        />
        <ActionButton
          label={isPending ? "Re-checking…" : "Re-detect"}
          icon={RefreshCcw}
          loading={isPending}
          onPress={() => onSubmit({ textToCheck, additionalComments: "" })}
        />
      </Panel>
      <ErrorText message={error} />
    </>
  );
}

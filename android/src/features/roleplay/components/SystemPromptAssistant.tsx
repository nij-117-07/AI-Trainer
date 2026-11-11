// src/features/roleplay/components/SystemPromptAssistant.tsx
/**
 * "Write with AI" disclosure. The user describes a character in a few words, and the AI writes the
 * system prompt into the field the caller passes to useSystemPromptAssistant. It opens when a
 * generate fails, so the error is never hidden.
 */
import { useEffect, useState } from "react";
import { Sparkles } from "lucide-react-native";
import { ActionButton, ErrorText, TextField } from "@/components/tool/FormControls";
import { Disclosure } from "@/components/tool/Disclosure";
import { PROMPT_IDEA_MAX } from "../options";
import type { SystemPromptAssistantState } from "../hooks/useSystemPromptAssistant";

export function SystemPromptAssistant({ assistant }: { assistant: SystemPromptAssistantState }) {
  const { idea, setIdea, pending, error, generate } = assistant;
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (error) setOpen(true);
  }, [error]);

  return (
    <Disclosure
      title="Write with AI"
      icon={Sparkles}
      summary="Describe a character. AI replaces the prompt."
      open={open}
      onToggle={setOpen}
    >
      <TextField
        label="Describe the character"
        placeholder="e.g. A grumpy Parisian waiter who hates rushed orders"
        value={idea}
        onChangeText={setIdea}
        editable={!pending}
        maxLength={PROMPT_IDEA_MAX}
        multiline
        voice
      />
      <ErrorText message={error} />
      <ActionButton
        label={pending ? "Writing the prompt…" : "Write system prompt"}
        icon={Sparkles}
        variant="outline"
        loading={pending}
        disabled={!idea.trim()}
        onPress={generate}
      />
    </Disclosure>
  );
}

// src/features/roleplay/components/SystemPromptAssistant.tsx
/**
 * "Write with AI" block. The user describes a character in a few words, and the AI writes the
 * system prompt into the field the caller passes to useSystemPromptAssistant.
 */
import { Sparkles } from "lucide-react-native";
import { ActionButton, ErrorText, TextField } from "@/components/tool/FormControls";
import { PROMPT_IDEA_MAX } from "../options";
import type { SystemPromptAssistantState } from "../hooks/useSystemPromptAssistant";

export function SystemPromptAssistant({ assistant }: { assistant: SystemPromptAssistantState }) {
  const { idea, setIdea, pending, error, generate } = assistant;

  return (
    <>
      <TextField
        label="Describe the character"
        placeholder="e.g. A grumpy Parisian waiter who hates rushed orders"
        hint="The AI writes the system prompt from this. You can edit it afterwards."
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
    </>
  );
}

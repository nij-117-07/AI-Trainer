// src/features/chatbot/components/PersonaAssistant.tsx
/**
 * "Write with AI" disclosure. The user describes a persona in a few words, and the AI fills in the
 * persona fields in the editor. It opens when a generate fails, so the error is never hidden.
 */
import { useEffect, useState } from "react";
import { Sparkles } from "lucide-react-native";
import { ActionButton, ErrorText, TextField } from "@/components/tool/FormControls";
import { Disclosure } from "@/components/tool/Disclosure";
import { PERSONA_LIMITS } from "../lib/persona-model";
import type { PersonaAssistantState } from "../hooks/usePersonaAssistant";

export function PersonaAssistant({ assistant }: { assistant: PersonaAssistantState }) {
  const { idea, setIdea, pending, error, generate } = assistant;
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (error) setOpen(true);
  }, [error]);

  return (
    <Disclosure
      title="Write with AI"
      icon={Sparkles}
      summary="Describe a persona. AI fills in the fields below."
      open={open}
      onToggle={setOpen}
    >
      <TextField
        label="Describe the persona"
        hint="AI replaces the name, description, avatar, system prompt, and starter prompts. Model and sampling settings stay as they are."
        placeholder="e.g. A patient maths tutor who explains each step for teenagers"
        value={idea}
        onChangeText={setIdea}
        editable={!pending}
        maxLength={PERSONA_LIMITS.ideaChars}
        multiline
        voice
      />
      <ErrorText message={error} />
      <ActionButton
        label={pending ? "Writing the persona…" : "Write persona"}
        icon={Sparkles}
        variant="outline"
        loading={pending}
        disabled={!idea.trim()}
        onPress={() => void generate()}
      />
    </Disclosure>
  );
}

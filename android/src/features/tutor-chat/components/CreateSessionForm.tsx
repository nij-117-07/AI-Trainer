// src/features/tutor-chat/components/CreateSessionForm.tsx
/** Form for a new tutoring session: master topic and optional background, then Start Chatting. */
import { useState } from "react";
import { RefreshCcw, Sparkles } from "lucide-react-native";
import { ActionButton, ErrorText, Panel, TextField } from "@/components/tool/FormControls";
import { SectionTitle } from "@/components/tool/SectionTitle";
import type { TutorSettingsValues } from "../lib/types";

interface CreateSessionFormProps {
  onCreate: (values: TutorSettingsValues) => Promise<void>;
}

const EMPTY: TutorSettingsValues = { masterTopic: "", additionalContext: "" };

export function CreateSessionForm({ onCreate }: CreateSessionFormProps) {
  const [form, setForm] = useState<TutorSettingsValues>(EMPTY);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function update<K extends keyof TutorSettingsValues>(key: K, value: TutorSettingsValues[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function submit() {
    setError(null);
    setCreating(true);
    try {
      await onCreate(form);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create the session.");
    } finally {
      setCreating(false);
    }
  }

  return (
    <Panel>
      <SectionTitle icon={Sparkles} title="Start a new tutoring session" />
      <TextField
        label="Master topic"
        placeholder="e.g. Quantum Physics"
        value={form.masterTopic}
        onChangeText={(text) => update("masterTopic", text)}
        editable={!creating}
        maxLength={300}
      />
      <TextField
        label="Your background & context (optional)"
        hint="You can edit this later from inside the chat."
        placeholder="Background, goals, or learning style…"
        value={form.additionalContext}
        onChangeText={(text) => update("additionalContext", text)}
        editable={!creating}
        maxLength={2000}
        multiline
      />
      <ErrorText message={error} />
      <ActionButton
        label={creating ? "Creating…" : "Start chatting"}
        icon={Sparkles}
        loading={creating}
        onPress={submit}
      />
      <ActionButton label="Reset" icon={RefreshCcw} variant="outline" onPress={() => setForm(EMPTY)} />
    </Panel>
  );
}

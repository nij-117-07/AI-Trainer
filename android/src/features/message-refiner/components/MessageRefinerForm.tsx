/**
 * Message Refiner form, on its own page. The fields fill the body and the refine button is pinned
 * in the footer. A successful refine saves the result and calls onGenerated, which returns to the
 * result page.
 */
import { StyleSheet, View } from "react-native";
import { Sparkles } from "lucide-react-native";
import { spacing } from "@/theme";
import { useAiSettings } from "@/features/ai-settings/providers/AiSettingsProvider";
import { ActionButton, ChoiceChips, ErrorText, Field, TextField } from "@/components/tool/FormControls";
import { useRequest } from "@/hooks/useRequest";
import { refineMessage } from "../lib/generators";
import { AUDIENCE_MAX, GOAL_MAX, MESSAGE_MAX } from "../lib/validate";
import { toneOptions } from "../options";
import { saveMessageRefinement, usePersistedForm } from "../hooks/usePersistedDraft";
import type { MessageRefinerFormValues } from "../types";

export interface MessageRefinerFormState {
  form: MessageRefinerFormValues;
  pending: boolean;
  error: string | null;
  update: <K extends keyof MessageRefinerFormValues>(key: K, value: MessageRefinerFormValues[K]) => void;
  submit: () => Promise<void>;
  reset: () => void;
}

export function useMessageRefinerForm(onGenerated: () => void): MessageRefinerFormState {
  const { settings } = useAiSettings();
  const { form, setForm, reset: resetForm } = usePersistedForm();
  const request = useRequest(refineMessage);

  function update<K extends keyof MessageRefinerFormValues>(key: K, value: MessageRefinerFormValues[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function reset() {
    resetForm();
    request.reset();
  }

  async function submit() {
    const result = await request.run(settings, form);
    if (!result) return;
    await saveMessageRefinement({ form, result }).catch(() => undefined);
    onGenerated();
  }

  return { form, pending: request.pending, error: request.error, update, submit, reset };
}

export function MessageRefinerFormFields({ refiner }: { refiner: MessageRefinerFormState }) {
  const { form, pending, update } = refiner;

  return (
    <>
      <TextField
        label="Your message"
        hint={`Up to ${MESSAGE_MAX} characters.`}
        placeholder="e.g. Hi, can we move our call to later? I'm stuck in another meeting."
        value={form.message}
        onChangeText={(text) => update("message", text)}
        editable={!pending}
        multiline
        maxLength={MESSAGE_MAX}
        voice
      />
      <Field label="Tone">
        <ChoiceChips options={toneOptions} value={form.tone} onChange={(value) => update("tone", value)} />
      </Field>
      <TextField
        label="Who is it for? (optional)"
        placeholder="e.g. my manager, a new client, a friend"
        value={form.audience}
        onChangeText={(text) => update("audience", text)}
        editable={!pending}
        maxLength={AUDIENCE_MAX}
      />
      <TextField
        label="What should it achieve? (optional)"
        placeholder="e.g. get a reply by Friday, confirm the meeting"
        value={form.goal}
        onChangeText={(text) => update("goal", text)}
        editable={!pending}
        maxLength={GOAL_MAX}
      />
    </>
  );
}

export function MessageRefinerFormFooter({ refiner }: { refiner: MessageRefinerFormState }) {
  const { pending, error, submit } = refiner;

  return (
    <View style={styles.footer}>
      <ErrorText message={error} />
      <ActionButton
        label={pending ? "Refining…" : "Refine message"}
        icon={Sparkles}
        loading={pending}
        onPress={submit}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  footer: {
    gap: spacing.md,
  },
});

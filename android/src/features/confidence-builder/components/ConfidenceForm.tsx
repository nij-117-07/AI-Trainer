// src/features/confidence-builder/components/ConfidenceForm.tsx
/** Setup page: what to build confidence in, in the body. Create tasks is the footer action. */
import { StyleSheet, View } from "react-native";
import { ArrowLeft, Sparkles } from "lucide-react-native";
import { spacing } from "@/theme";
import { ActionButton, ChoiceChips, ErrorText, Field, TextField } from "@/components/tool/FormControls";
import { CountSlider } from "@/components/tool/CountSlider";
import type { ConfidenceBuilderState } from "../hooks/useConfidenceBuilder";
import { comfortOptions, focusOptions } from "../options";
import { INSTRUCTIONS_MAX, MAX_TASKS, SITUATION_MAX } from "../lib/validate";

export function ConfidenceFormBody({ state }: { state: ConfidenceBuilderState }) {
  const { form, pending, update } = state;

  return (
    <View style={styles.body}>
      <Field label="Where do you want to feel more confident?">
        <ChoiceChips options={focusOptions} value={form.focus} onChange={(value) => update("focus", value)} />
      </Field>
      <Field label="How comfortable do you feel with this now?">
        <ChoiceChips options={comfortOptions} value={form.comfort} onChange={(value) => update("comfort", value)} />
      </Field>
      <TextField
        label="Coming up (optional)"
        placeholder="e.g. Team meeting on Thursday"
        value={form.situation}
        onChangeText={(text) => update("situation", text)}
        editable={!pending}
        maxLength={SITUATION_MAX}
      />
      <CountSlider
        label="Number of tasks"
        min={1}
        max={MAX_TASKS}
        value={form.numTasks}
        onChange={(value) => update("numTasks", value)}
      />
      <TextField
        label="Instructions (optional)"
        placeholder="e.g. Keep tasks at home or online"
        value={form.instructions}
        onChangeText={(text) => update("instructions", text)}
        editable={!pending}
        maxLength={INSTRUCTIONS_MAX}
        multiline
        voice
      />
    </View>
  );
}

export function ConfidenceFormFooter({ state, onBack }: { state: ConfidenceBuilderState; onBack?: () => void }) {
  const { pending, error, saveError, generate } = state;

  return (
    <View style={styles.footer}>
      <ErrorText message={error} />
      <ErrorText message={saveError} />
      <ActionButton
        label={pending ? "Creating tasks…" : "Create tasks"}
        icon={Sparkles}
        loading={pending}
        onPress={generate}
      />
      {onBack ? (
        <ActionButton label="Back to tasks" icon={ArrowLeft} variant="outline" disabled={pending} onPress={onBack} />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  body: {
    gap: spacing.lg,
  },
  footer: {
    gap: spacing.sm,
  },
});

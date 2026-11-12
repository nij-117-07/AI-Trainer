// src/features/confidence-builder/components/ConfidenceForm.tsx
/** New task set page: what to build confidence in, in the body. Create tasks is the footer action. */
import { StyleSheet, View } from "react-native";
import { Sparkles } from "lucide-react-native";
import { spacing } from "@/theme";
import { ActionButton, ChoiceChips, ErrorText, Field, TextField } from "@/components/tool/FormControls";
import type { ConfidenceCreateState } from "../hooks/useConfidenceCreate";
import { comfortOptions, focusOptions } from "../options";
import { INSTRUCTIONS_MAX, SITUATION_MAX } from "../lib/validate";

export function ConfidenceFormBody({ state }: { state: ConfidenceCreateState }) {
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

export function ConfidenceFormFooter({ state }: { state: ConfidenceCreateState }) {
  const { pending, error, generate } = state;

  return (
    <View style={styles.footer}>
      <ErrorText message={error} />
      <ActionButton
        label={pending ? "Creating tasks…" : "Create tasks"}
        icon={Sparkles}
        loading={pending}
        onPress={generate}
      />
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

// src/features/debate/components/DebateForm.tsx
/**
 * Debate setup form, shown on its own page. The fields fill the body; the error and the start
 * button sit in the footer. A successful build returns to the debate page.
 */
import { StyleSheet, View } from "react-native";
import { Swords } from "lucide-react-native";
import { spacing } from "@/theme";
import { ActionButton, ChoiceChips, ErrorText, Field, TextField } from "@/components/tool/FormControls";
import { CountSlider } from "@/components/tool/CountSlider";
import type { DebateSetupState } from "../hooks/useDebateSetup";
import { LIMITS, SIDE_CHOICES } from "../options";

export function DebateFormFields({ setup }: { setup: DebateSetupState }) {
  const { form, pending, update } = setup;

  return (
    <>
      <TextField
        label="Archetype"
        placeholder="e.g. Cynical Academic, Aggressive Trial Lawyer"
        value={form.archetype}
        onChangeText={(text) => update("archetype", text)}
        editable={!pending}
        maxLength={LIMITS.archetype}
      />
      <TextField
        label="Speech style"
        placeholder="e.g. Sesquipedalian, punchy and short, data-driven"
        value={form.style}
        onChangeText={(text) => update("style", text)}
        editable={!pending}
        maxLength={LIMITS.style}
      />
      <CountSlider
        label="Rhetorical intensity"
        min={1}
        max={10}
        value={form.intensity}
        onChange={(value) => update("intensity", value)}
      />
      <TextField
        label="Influences"
        placeholder="e.g. Sartre, Game Theory (comma-separated)"
        value={form.influences}
        onChangeText={(text) => update("influences", text)}
        editable={!pending}
        maxLength={LIMITS.influences}
      />
      <TextField
        label="Debate topic"
        placeholder="e.g. Universal Basic Income"
        value={form.topic}
        onChangeText={(text) => update("topic", text)}
        editable={!pending}
        maxLength={LIMITS.topic}
      />
      <Field label="Who opens the debate?">
        <ChoiceChips options={SIDE_CHOICES} value={form.opener} onChange={(value) => update("opener", value)} />
      </Field>
      <TextField
        label="Custom constraints (optional)"
        placeholder="e.g. Never uses emojis"
        value={form.customConstraints}
        onChangeText={(text) => update("customConstraints", text)}
        editable={!pending}
        maxLength={LIMITS.constraints}
        multiline
        voice
      />
    </>
  );
}

export function DebateFormFooter({ setup }: { setup: DebateSetupState }) {
  const { pending, error, submit } = setup;

  return (
    <View style={styles.footer}>
      <ErrorText message={error} />
      <ActionButton
        label={pending ? "Building the personas…" : "Start debate"}
        icon={Swords}
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

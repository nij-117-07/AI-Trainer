// src/features/riddle/components/RiddleForm.tsx
/**
 * Riddle setup form, shown on its own page. The fields fill the body; the generate button and the
 * error sit in the footer. A successful generate returns to the riddle page.
 */
import { StyleSheet, View } from "react-native";
import { Sparkles } from "lucide-react-native";
import { spacing } from "@/theme";
import { ActionButton, ErrorText, TextField } from "@/components/tool/FormControls";
import { SelectField } from "@/components/tool/SelectField";
import { COGNITIVE_DOMAIN_OPTIONS, DIFFICULTY_OPTIONS, USER_INSTRUCTIONS_MAX } from "../options";
import type { RiddleSetupState } from "../hooks/useRiddleSetup";

export function RiddleFormFields({ setup }: { setup: RiddleSetupState }) {
  const { form, pending, update } = setup;

  return (
    <>
      <TextField
        label="Topic"
        placeholder="e.g. Space, Ancient Architecture"
        value={form.fieldOfInterest}
        onChangeText={(text) => update("fieldOfInterest", text)}
        editable={!pending}
        maxLength={200}
      />
      <SelectField
        label="Cognitive domain"
        options={COGNITIVE_DOMAIN_OPTIONS}
        value={form.targetDomain}
        onChange={(value) => update("targetDomain", value)}
        customPlaceholder="e.g. Musical, Culinary"
      />
      <SelectField
        label="Difficulty"
        options={DIFFICULTY_OPTIONS}
        value={form.difficultyLevel}
        onChange={(value) => update("difficultyLevel", value)}
        customPlaceholder="e.g. Child-friendly, Olympiad"
      />
      <TextField
        label="User instructions (optional)"
        placeholder="e.g. Keep it under three lines, no numbers"
        value={form.userInstructions}
        onChangeText={(text) => update("userInstructions", text)}
        editable={!pending}
        maxLength={USER_INSTRUCTIONS_MAX}
        multiline
        voice
      />
    </>
  );
}

export function RiddleFormFooter({ setup }: { setup: RiddleSetupState }) {
  const { pending, error, submit } = setup;

  return (
    <View style={styles.footer}>
      <ErrorText message={error} />
      <ActionButton
        label={pending ? "Crafting the riddle…" : "Generate riddle"}
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

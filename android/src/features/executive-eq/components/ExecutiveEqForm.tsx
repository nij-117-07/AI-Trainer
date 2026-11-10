// src/features/executive-eq/components/ExecutiveEqForm.tsx
/**
 * Executive EQ setup form, shown on its own page. The fields fill the body; the error and the
 * start button sit in the footer. A successful start returns to the practice page.
 */
import { StyleSheet, View } from "react-native";
import { Sparkles } from "lucide-react-native";
import { spacing } from "@/theme";
import { ActionButton, ErrorText, TextField } from "@/components/tool/FormControls";
import { SelectField } from "@/components/tool/SelectField";
import type { ExecutiveEqSetupState } from "../hooks/useExecutiveEqSetup";
import { DIFFICULTY_OPTIONS, LEARNING_FOCUS_OPTIONS } from "../options";

export function ExecutiveEqFormFields({ setup }: { setup: ExecutiveEqSetupState }) {
  const { form, pending, update } = setup;

  return (
    <>
      <TextField
        label="Your role"
        placeholder="e.g. VP of Sales, CEO"
        value={form.userRole}
        onChangeText={(text) => update("userRole", text)}
        editable={!pending}
        maxLength={300}
      />
      <TextField
        label="Narrative arc"
        placeholder="The strategic goal, e.g. Deflecting a hostile takeover"
        value={form.narrativeArc}
        onChangeText={(text) => update("narrativeArc", text)}
        editable={!pending}
        maxLength={300}
        multiline
        voice
      />
      <SelectField
        label="Learning focus"
        options={LEARNING_FOCUS_OPTIONS}
        value={form.learningFocus}
        onChange={(value) => update("learningFocus", value)}
        allowCustom={false}
      />
      <SelectField
        label="Difficulty"
        options={DIFFICULTY_OPTIONS}
        value={form.difficultyLevel}
        onChange={(value) => update("difficultyLevel", value)}
        allowCustom={false}
      />
      <TextField
        label="Industry context (optional)"
        placeholder="e.g. Biotech, FinTech"
        value={form.industryContext}
        onChangeText={(text) => update("industryContext", text)}
        editable={!pending}
        maxLength={200}
      />
    </>
  );
}

export function ExecutiveEqFormFooter({ setup }: { setup: ExecutiveEqSetupState }) {
  const { pending, error, submit } = setup;

  return (
    <View style={styles.footer}>
      <ErrorText message={error} />
      <ActionButton
        label={pending ? "Setting the scene…" : "Start simulation"}
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

// src/features/clarity-trainer/components/ClarityForm.tsx
/**
 * Clarity Trainer setup form, shown on its own page. The fields fill the body; the generate button
 * and the error sit in the footer. A successful generate returns to the practice page.
 */
import { StyleSheet, View } from "react-native";
import { Sparkles } from "lucide-react-native";
import { spacing } from "@/theme";
import { ActionButton, ErrorText, TextField } from "@/components/tool/FormControls";
import { SelectField } from "@/components/tool/SelectField";
import type { ClaritySetupState } from "../hooks/useClaritySetup";
import { CATEGORY_OPTIONS, DIFFICULTY_OPTIONS, LIMITS } from "../options";

export function ClarityFormFields({ setup }: { setup: ClaritySetupState }) {
  const { form, pending, update } = setup;

  return (
    <>
      <SelectField
        label="Difficulty"
        options={DIFFICULTY_OPTIONS}
        value={form.difficulty}
        onChange={(value) => update("difficulty", value)}
        allowCustom={false}
      />
      <SelectField
        label="Scenario category"
        options={CATEGORY_OPTIONS}
        value={form.category}
        onChange={(value) => update("category", value)}
        allowCustom={false}
      />
      <TextField
        label="Your context (optional)"
        placeholder="e.g. Software engineer, manager"
        value={form.userContext}
        onChangeText={(text) => update("userContext", text)}
        editable={!pending}
        maxLength={LIMITS.userContext}
      />
    </>
  );
}

export function ClarityFormFooter({ setup }: { setup: ClaritySetupState }) {
  const { pending, error, submit } = setup;

  return (
    <View style={styles.footer}>
      <ErrorText message={error} />
      <ActionButton
        label={pending ? "Creating scenario…" : "Generate scenario"}
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

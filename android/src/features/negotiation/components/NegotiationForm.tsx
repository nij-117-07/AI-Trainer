// src/features/negotiation/components/NegotiationForm.tsx
/**
 * Negotiation setup form, shown on its own page. The fields fill the body; the start button and
 * the error sit in the footer. A successful start returns to the practice page.
 */
import { StyleSheet, View } from "react-native";
import { Handshake } from "lucide-react-native";
import { spacing } from "@/theme";
import { ActionButton, ErrorText, TextField } from "@/components/tool/FormControls";
import { SelectField } from "@/components/tool/SelectField";
import type { NegotiationSetupState } from "../hooks/useNegotiationSetup";
import { DIFFICULTY_OPTIONS } from "../options";
import { DOMAIN_MAX } from "../lib/validate";

export function NegotiationFormFields({ setup }: { setup: NegotiationSetupState }) {
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
      <TextField
        label="Topic"
        placeholder="e.g. salary, real estate, business deal, diplomatic"
        value={form.domain}
        onChangeText={(text) => update("domain", text)}
        editable={!pending}
        maxLength={DOMAIN_MAX}
      />
    </>
  );
}

export function NegotiationFormFooter({ setup }: { setup: NegotiationSetupState }) {
  const { pending, error, submit } = setup;

  return (
    <View style={styles.footer}>
      <ErrorText message={error} />
      <ActionButton
        label={pending ? "Setting the scene…" : "Start negotiation"}
        icon={Handshake}
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

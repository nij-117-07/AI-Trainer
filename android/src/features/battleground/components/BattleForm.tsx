// src/features/battleground/components/BattleForm.tsx
/**
 * Battle setup form, on its own page. The fields fill the body; the error and the start button sit
 * in the footer. A successful start returns to the battle page.
 */
import { StyleSheet, View } from "react-native";
import { Swords } from "lucide-react-native";
import { spacing } from "@/theme";
import { ActionButton, ChoiceChips, ErrorText, Field, TextField } from "@/components/tool/FormControls";
import type { BattleSetupState } from "../hooks/useBattleSetup";
import { DIFFICULTY_OPTIONS } from "../options";
import type { BattleDifficulty } from "../types";

export function BattleFormFields({ setup }: { setup: BattleSetupState }) {
  const { form, pending, update } = setup;

  return (
    <>
      <TextField
        label="Battleground topic"
        placeholder="e.g. Cybersecurity Ransomware Attack"
        value={form.topic}
        onChangeText={(text) => update("topic", text)}
        editable={!pending}
        maxLength={300}
      />
      <Field label="Difficulty">
        <ChoiceChips
          options={DIFFICULTY_OPTIONS}
          value={form.difficulty}
          onChange={(value) => update("difficulty", value as BattleDifficulty)}
        />
      </Field>
      <TextField
        label="Callsign (optional)"
        placeholder="e.g. Viper"
        value={form.name}
        onChangeText={(text) => update("name", text)}
        editable={!pending}
        maxLength={100}
      />
      <TextField
        label="Expertise (optional)"
        placeholder="e.g. cybersecurity, tactics"
        value={form.expertise}
        onChangeText={(text) => update("expertise", text)}
        editable={!pending}
        maxLength={300}
      />
      <TextField
        label="Preferred style (optional)"
        placeholder="e.g. aggressive, defensive, stealth"
        value={form.preferredStyle}
        onChangeText={(text) => update("preferredStyle", text)}
        editable={!pending}
        maxLength={300}
      />
      <TextField
        label="Background (optional)"
        placeholder="e.g. Ten years as a SOC analyst"
        value={form.background}
        onChangeText={(text) => update("background", text)}
        editable={!pending}
        maxLength={1000}
        multiline
        voice
      />
    </>
  );
}

export function BattleFormFooter({ setup }: { setup: BattleSetupState }) {
  const { pending, error, submit } = setup;

  return (
    <View style={styles.footer}>
      <ErrorText message={error} />
      <ActionButton
        label={pending ? "Starting battle…" : "Start battle"}
        icon={Swords}
        loading={pending}
        onPress={() => void submit()}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  footer: {
    gap: spacing.md,
  },
});

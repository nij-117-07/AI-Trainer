// src/features/joke-coach/components/JokeLabForm.tsx
/**
 * Scenario setup form, shown on its own page. The fields fill the page body; the error and the
 * generate button sit in the footer. A successful generate returns to the Joke Lab.
 */
import { StyleSheet, View } from "react-native";
import { Sparkles } from "lucide-react-native";
import { spacing } from "@/theme";
import { ActionButton, ErrorText, TextField } from "@/components/tool/FormControls";
import { SelectField } from "@/components/tool/SelectField";
import { LANGUAGE_OPTIONS } from "../options";
import { THEME_MAX } from "../lib/validate";
import type { JokeLabSetupState } from "../hooks/useJokeLabSetup";

export function JokeLabFormFields({ setup }: { setup: JokeLabSetupState }) {
  const { form, pending, update } = setup;

  return (
    <>
      <SelectField
        label="Language"
        options={LANGUAGE_OPTIONS}
        value={form.language}
        onChange={(value) => update("language", value)}
        customPlaceholder="e.g. Swahili"
      />
      <TextField
        label="Theme (optional)"
        placeholder="e.g. office life, travel, cooking"
        value={form.theme}
        onChangeText={(text) => update("theme", text)}
        editable={!pending}
        maxLength={THEME_MAX}
      />
    </>
  );
}

export function JokeLabFormFooter({ setup }: { setup: JokeLabSetupState }) {
  const { pending, error, submit } = setup;

  return (
    <View style={styles.footer}>
      <ErrorText message={error} />
      <ActionButton
        label={pending ? "Writing a scenario…" : "Generate scenario"}
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

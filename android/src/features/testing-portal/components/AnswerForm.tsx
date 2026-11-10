// src/features/testing-portal/components/AnswerForm.tsx
/**
 * Expert answer form, shown on its own page. The fields fill the body; the error and the generate
 * button sit in the footer. A successful generate returns to the Answer page.
 */
import { StyleSheet, Text, View } from "react-native";
import { BookOpen } from "lucide-react-native";
import { spacing, useThemeColors } from "@/theme";
import { ActionButton, ErrorText, TextField } from "@/components/tool/FormControls";
import { SelectField } from "@/components/tool/SelectField";
import { difficultyOptions, responseFormatOptions } from "../options";
import type { AnswerSetupState } from "../hooks/useAnswerSetup";
import type { ResponseFormat } from "../types";

export function AnswerFormFields({ setup }: { setup: AnswerSetupState }) {
  const colors = useThemeColors();
  const { form, pending, update, hasAnswer } = setup;

  return (
    <>
      {hasAnswer && (
        <Text style={[styles.note, { color: colors.mutedForeground }]}>
          A new answer replaces the one you have.
        </Text>
      )}
      <TextField
        label="Question"
        placeholder="e.g. How does a hash map handle collisions?"
        value={form.question}
        onChangeText={(text) => update("question", text)}
        editable={!pending}
        maxLength={2000}
        multiline
        voice
      />
      <TextField
        label="Context"
        placeholder="e.g. Job interview for a backend role"
        value={form.context}
        onChangeText={(text) => update("context", text)}
        editable={!pending}
        maxLength={200}
      />
      <SelectField
        label="Difficulty"
        options={difficultyOptions}
        value={form.difficulty}
        onChange={(value) => update("difficulty", value)}
        customPlaceholder="e.g. Graduate level, Principal engineer"
      />
      <SelectField
        label="Response format"
        options={responseFormatOptions}
        value={form.responseFormat}
        onChange={(value) => update("responseFormat", value as ResponseFormat)}
        allowCustom={false}
      />
      <TextField
        label="User instructions (optional)"
        placeholder="e.g. Include a short code example"
        value={form.customInstructions}
        onChangeText={(text) => update("customInstructions", text)}
        editable={!pending}
        maxLength={1000}
        multiline
        voice
      />
    </>
  );
}

export function AnswerFormFooter({ setup }: { setup: AnswerSetupState }) {
  const { pending, error, submit } = setup;

  return (
    <View style={styles.footer}>
      <ErrorText message={error} />
      <ActionButton
        label={pending ? "Writing answer…" : "Generate answer"}
        icon={BookOpen}
        loading={pending}
        onPress={() => void submit()}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  note: {
    fontSize: 14,
    lineHeight: 20,
  },
  footer: {
    gap: spacing.md,
  },
});

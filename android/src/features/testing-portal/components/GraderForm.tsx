// src/features/testing-portal/components/GraderForm.tsx
/**
 * Performance Grader form, shown on its own page. The fields and the optional image fill the body;
 * the error and the grade button sit in the footer. A successful grade returns to the grader page.
 */
import { StyleSheet, Text, View } from "react-native";
import { ShieldCheck } from "lucide-react-native";
import { spacing, useThemeColors } from "@/theme";
import { ActionButton, ErrorText, TextField } from "@/components/tool/FormControls";
import { ImagePickerField } from "@/components/tool/ImagePickerField";
import { SelectField } from "@/components/tool/SelectField";
import { expectedLevelOptions } from "../options";
import type { GraderSetupState } from "../hooks/useGraderSetup";

export function GraderFormFields({ setup }: { setup: GraderSetupState }) {
  const colors = useThemeColors();
  const { form, pending, update, image, setImage, hasGrade } = setup;

  return (
    <>
      {hasGrade && (
        <Text style={[styles.note, { color: colors.mutedForeground }]}>
          A new grade replaces the one you have.
        </Text>
      )}
      <TextField
        label="Scenario"
        placeholder="e.g. Handle a difficult customer complaint"
        value={form.scenario}
        onChangeText={(text) => update("scenario", text)}
        editable={!pending}
        maxLength={200}
        voice
      />
      <TextField
        label="Question asked"
        placeholder="e.g. How would you de-escalate this situation?"
        value={form.questionAsked}
        onChangeText={(text) => update("questionAsked", text)}
        editable={!pending}
        maxLength={2000}
        multiline
        voice
      />
      <TextField
        label="Target objective"
        placeholder="e.g. Calm the customer and offer a resolution"
        value={form.targetObjective}
        onChangeText={(text) => update("targetObjective", text)}
        editable={!pending}
        maxLength={1000}
        voice
      />
      <SelectField
        label="Expected level"
        options={expectedLevelOptions}
        value={form.expectedLevel}
        onChange={(value) => update("expectedLevel", value)}
        customPlaceholder="e.g. Master-level, Graduate"
      />
      <TextField
        label="Your answer (optional)"
        placeholder="Type or paste your written answer, or attach an image below."
        value={form.userAnswerText}
        onChangeText={(text) => update("userAnswerText", text)}
        editable={!pending}
        maxLength={5000}
        multiline
        voice
      />
      <ImagePickerField value={image} onChange={setImage} disabled={pending} />
    </>
  );
}

export function GraderFormFooter({ setup }: { setup: GraderSetupState }) {
  const { pending, error, submit } = setup;

  return (
    <View style={styles.footer}>
      <ErrorText message={error} />
      <ActionButton
        label={pending ? "Grading…" : "Grade my answer"}
        icon={ShieldCheck}
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

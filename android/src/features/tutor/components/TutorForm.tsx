// src/features/tutor/components/TutorForm.tsx
/** Tutor question form, pinned to the footer: the question first, then four settings with defaults. */
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { Sparkles } from "lucide-react-native";
import { spacing, useThemeColors } from "@/theme";
import { ActionButton, ErrorText, TextField } from "@/components/tool/FormControls";
import { SelectField, type SelectOption } from "@/components/tool/SelectField";
import type { PromptTemplate, TutorFormValues } from "../types";
import { learningStyleOptions, studentLevelOptions } from "../lib/options";

interface TutorFormProps {
  form: TutorFormValues;
  personas: PromptTemplate[];
  onChange: (patch: Partial<TutorFormValues>) => void;
  onSubmit: () => void;
  onManagePersonas: () => void;
  pending: boolean;
  error: string | null;
}

export function TutorForm({ form, personas, onChange, onSubmit, onManagePersonas, pending, error }: TutorFormProps) {
  const colors = useThemeColors();
  const personaOptions: SelectOption[] = personas.map((persona) => ({
    value: persona.name,
    label: persona.source === "built-in" ? `${persona.name} (built-in)` : persona.name,
  }));

  return (
    <View style={styles.footer}>
      <ScrollView style={styles.fields} contentContainerStyle={styles.fieldsContent} keyboardShouldPersistTaps="handled">
        <TextField
          label="Your question"
          placeholder="e.g. Why does water boil at a lower temperature on a mountain?"
          value={form.userQuery}
          onChangeText={(text) => onChange({ userQuery: text })}
          editable={!pending}
          maxLength={2000}
          multiline
          voice
        />
        <SelectField
          label="Persona"
          options={personaOptions}
          value={form.persona}
          onChange={(value) => onChange({ persona: value })}
          allowCustom={false}
        />
        <Pressable
          onPress={onManagePersonas}
          accessibilityRole="button"
          accessibilityLabel="Manage personas"
          style={({ pressed }) => [styles.link, pressed && { opacity: 0.6 }]}
        >
          <Text style={[styles.linkText, { color: colors.primary }]}>Manage personas</Text>
        </Pressable>
        <SelectField
          label="Student level"
          options={studentLevelOptions}
          value={form.studentLevel}
          onChange={(value) => onChange({ studentLevel: value })}
          customLabel="Other / custom"
          customPlaceholder="e.g. Year 9 student"
        />
        <SelectField
          label="Learning style"
          options={learningStyleOptions}
          value={form.learningStyle}
          onChange={(value) => onChange({ learningStyle: value })}
          customLabel="Other / custom"
          customPlaceholder="e.g. Socratic questions"
        />
        <TextField
          label="Scenario (optional)"
          placeholder="e.g. preparing for an exam"
          value={form.currentScenario}
          onChangeText={(text) => onChange({ currentScenario: text })}
          editable={!pending}
          maxLength={500}
        />
      </ScrollView>
      <ErrorText message={error} />
      <ActionButton
        label={pending ? "Preparing your lesson…" : "Explain it to me"}
        icon={Sparkles}
        loading={pending}
        onPress={onSubmit}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  footer: {
    gap: spacing.md,
  },
  fields: {
    maxHeight: 340,
  },
  fieldsContent: {
    gap: spacing.md,
  },
  link: {
    minHeight: 40,
    justifyContent: "center",
    alignSelf: "flex-end",
    paddingHorizontal: spacing.sm,
  },
  linkText: {
    fontSize: 14,
    fontWeight: "600",
  },
});

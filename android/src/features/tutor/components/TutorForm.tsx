// src/features/tutor/components/TutorForm.tsx
/** Tutor question form: the question, the teaching style, two presets, and an optional scenario sit in the body. */
import { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { Pencil, Sparkles } from "lucide-react-native";
import { shape, spacing, touchTarget, typeScale, useThemeColors } from "@/theme";
import { ActionButton, ChoiceChips, ErrorText, Field, Panel, TextField, pointerCursor } from "@/components/tool/FormControls";
import type { SelectOption } from "@/components/tool/SelectField";
import type { PromptTemplate, TutorFormValues } from "../types";
import { learningStyleOptions, studentLevelOptions } from "../lib/options";

const CUSTOM = "__custom__";

interface TutorFormProps {
  form: TutorFormValues;
  personas: PromptTemplate[];
  onChange: (patch: Partial<TutorFormValues>) => void;
  onManagePersonas: () => void;
  pending: boolean;
}

export function TutorForm({ form, personas, onChange, onManagePersonas, pending }: TutorFormProps) {
  const colors = useThemeColors();
  const teachingStyleOptions: SelectOption[] = personas.map((persona) => ({ value: persona.name, label: persona.name }));

  return (
    <Panel>
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
      <View style={styles.teachingStyle}>
        <View style={styles.labelRow}>
          <Text style={[styles.label, { color: colors.foreground }]}>Teaching style</Text>
          <Pressable
            onPress={onManagePersonas}
            accessibilityRole="button"
            accessibilityLabel="Edit teaching styles"
            style={({ pressed }) => [styles.iconButton, pointerCursor, pressed && { backgroundColor: colors.muted }]}
          >
            <Pencil size={18} color={colors.foreground} />
          </Pressable>
        </View>
        <ChoiceChips
          options={teachingStyleOptions}
          value={form.persona}
          onChange={(value) => onChange({ persona: value })}
          disabled={pending}
        />
      </View>
      <PresetField
        label="Student level"
        options={studentLevelOptions}
        value={form.studentLevel}
        customPlaceholder="e.g. Year 9 student"
        disabled={pending}
        onChange={(value) => onChange({ studentLevel: value })}
      />
      <PresetField
        label="Learning style"
        options={learningStyleOptions}
        value={form.learningStyle}
        customPlaceholder="e.g. Socratic questions"
        disabled={pending}
        onChange={(value) => onChange({ learningStyle: value })}
      />
      <TextField
        label="Scenario (optional)"
        placeholder="e.g. preparing for an exam"
        value={form.currentScenario}
        onChangeText={(text) => onChange({ currentScenario: text })}
        editable={!pending}
        maxLength={500}
      />
    </Panel>
  );
}

export function TutorFormFooter({ pending, error, onSubmit }: { pending: boolean; error: string | null; onSubmit: () => void }) {
  return (
    <View style={styles.footer}>
      <ErrorText message={error} />
      <ActionButton
        label={pending ? "Asking tutor…" : "Ask tutor"}
        icon={Sparkles}
        loading={pending}
        onPress={onSubmit}
      />
    </View>
  );
}

interface PresetFieldProps {
  label: string;
  options: SelectOption[];
  value: string;
  customPlaceholder: string;
  disabled: boolean;
  onChange: (value: string) => void;
}

/** Preset chips plus a Custom chip that reveals a text box, for values the presets do not cover. */
function PresetField({ label, options, value, customPlaceholder, disabled, onChange }: PresetFieldProps) {
  const [customSelected, setCustomSelected] = useState(false);
  const isPreset = options.some((option) => option.value === value);
  const customMode = !isPreset && (customSelected || value !== "");

  return (
    <Field label={label}>
      <ChoiceChips
        options={[...options, { value: CUSTOM, label: "Custom" }]}
        value={customMode ? CUSTOM : value}
        disabled={disabled}
        onChange={(choice) => {
          setCustomSelected(choice === CUSTOM);
          onChange(choice === CUSTOM ? "" : choice);
        }}
      />
      {customMode ? (
        <TextField
          label={`Custom ${label.toLowerCase()}`}
          placeholder={customPlaceholder}
          value={value}
          onChangeText={onChange}
          editable={!disabled}
          maxLength={100}
        />
      ) : null}
    </Field>
  );
}

const styles = StyleSheet.create({
  footer: {
    gap: spacing.md,
  },
  teachingStyle: {
    gap: spacing.sm,
  },
  labelRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  label: {
    ...typeScale.body,
    fontWeight: "600",
  },
  iconButton: {
    width: touchTarget,
    height: touchTarget,
    borderRadius: shape.full,
    alignItems: "center",
    justifyContent: "center",
  },
});

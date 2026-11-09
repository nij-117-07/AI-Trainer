// src/features/chatbot/components/PersonaEditor.tsx
/** Form for creating or editing one persona. Validation runs before onSave is called. */
import { useState, type ReactNode } from "react";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import Slider from "@react-native-community/slider";
import { radius, spacing, useThemeColors } from "@/theme";
import { PERSONA_LIMITS, draftFromPersona, EMPTY_PERSONA_DRAFT, parseStarterText, validatePersonaDraft } from "../lib/persona-model";
import type { Persona, PersonaDraft } from "../types";

interface PersonaEditorProps {
  persona: Persona | null;
  onSave: (draft: PersonaDraft) => Promise<void>;
  onCancel: () => void;
}

export function PersonaEditor({ persona, onSave, onCancel }: PersonaEditorProps) {
  const colors = useThemeColors();
  const [draft, setDraft] = useState<PersonaDraft>(persona ? draftFromPersona(persona) : EMPTY_PERSONA_DRAFT);
  const [starterText, setStarterText] = useState(draft.starters.join("\n"));
  const [maxTokensText, setMaxTokensText] = useState(String(draft.maxTokens));
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  function patch<K extends keyof PersonaDraft>(key: K, value: PersonaDraft[K]) {
    setDraft((prev) => ({ ...prev, [key]: value }));
    setError(null);
  }

  async function submit() {
    const next: PersonaDraft = {
      ...draft,
      starters: parseStarterText(starterText),
      maxTokens: maxTokensText.trim() === "" ? 0 : Number(maxTokensText.trim()),
    };
    const problem = validatePersonaDraft(next);
    if (problem) {
      setError(problem);
      return;
    }
    setSaving(true);
    try {
      await onSave(next);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "The persona could not be saved.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <View style={styles.stack}>
      <Text style={[styles.heading, { color: colors.foreground }]}>{persona ? "Edit persona" : "New persona"}</Text>

      <View style={styles.row}>
        <Field label="Avatar">
          <TextInput
            value={draft.avatar}
            onChangeText={(value) => patch("avatar", value)}
            maxLength={PERSONA_LIMITS.avatarChars}
            accessibilityLabel="Avatar emoji"
            style={[styles.input, styles.avatarInput, inputColors(colors)]}
          />
        </Field>
        <View style={styles.grow}>
          <Field label="Name">
            <TextInput
              value={draft.name}
              onChangeText={(value) => patch("name", value)}
              placeholder="Maths tutor"
              placeholderTextColor={colors.mutedForeground}
              maxLength={PERSONA_LIMITS.nameChars}
              style={[styles.input, inputColors(colors)]}
            />
          </Field>
        </View>
      </View>

      <Field label="Description" hint="Shown in the persona list and on an empty chat.">
        <TextInput
          value={draft.description}
          onChangeText={(value) => patch("description", value)}
          placeholder="Explains algebra step by step"
          placeholderTextColor={colors.mutedForeground}
          maxLength={PERSONA_LIMITS.descriptionChars}
          multiline
          style={[styles.input, styles.multiline, inputColors(colors)]}
        />
      </Field>

      <Field label="System prompt" hint="Sent as the system message before every reply. This sets how the persona behaves.">
        <TextInput
          value={draft.systemPrompt}
          onChangeText={(value) => patch("systemPrompt", value)}
          placeholder="You are a patient maths tutor. Explain each step and check understanding."
          placeholderTextColor={colors.mutedForeground}
          multiline
          textAlignVertical="top"
          style={[styles.input, styles.promptInput, inputColors(colors)]}
        />
      </Field>

      <Field label="Model" hint="Leave empty to use the chat model from AI settings.">
        <TextInput
          value={draft.model}
          onChangeText={(value) => patch("model", value)}
          placeholder="Chat model from AI settings"
          placeholderTextColor={colors.mutedForeground}
          autoCapitalize="none"
          autoCorrect={false}
          style={[styles.input, inputColors(colors)]}
        />
      </Field>

      <SliderField
        label="Temperature"
        value={draft.temperature}
        min={0}
        max={2}
        step={0.1}
        hint="Lower is more focused and repeatable. Higher is more varied."
        onChange={(value) => patch("temperature", value)}
      />

      <SliderField
        label="Top P"
        value={draft.topP}
        min={0.05}
        max={1}
        step={0.05}
        hint="Limits the words the model considers. 1 uses them all."
        onChange={(value) => patch("topP", value)}
      />

      <Field label="Max tokens" hint="Longest reply in tokens. 0 uses the provider default.">
        <TextInput
          value={maxTokensText}
          onChangeText={(value) => {
            setMaxTokensText(value.replace(/[^0-9]/g, ""));
            setError(null);
          }}
          keyboardType="number-pad"
          placeholder="0"
          placeholderTextColor={colors.mutedForeground}
          style={[styles.input, inputColors(colors)]}
        />
      </Field>

      <Field label="Starter prompts" hint="One per line, up to four. Shown on an empty chat.">
        <TextInput
          value={starterText}
          onChangeText={(value) => {
            setStarterText(value);
            setError(null);
          }}
          placeholder={"Explain quadratic equations\nCheck my working"}
          placeholderTextColor={colors.mutedForeground}
          multiline
          textAlignVertical="top"
          style={[styles.input, styles.multiline, inputColors(colors)]}
        />
      </Field>

      {error ? (
        <Text accessibilityRole="alert" style={[styles.error, { color: colors.destructive }]}>
          {error}
        </Text>
      ) : null}

      <View style={styles.buttons}>
        <Pressable
          onPress={onCancel}
          accessibilityRole="button"
          accessibilityLabel="Cancel persona changes"
          style={({ pressed }) => [styles.button, { borderColor: colors.border }, pressed && { backgroundColor: colors.muted }]}
        >
          <Text style={[styles.buttonText, { color: colors.foreground }]}>Cancel</Text>
        </Pressable>
        <Pressable
          onPress={() => void submit()}
          disabled={saving}
          accessibilityRole="button"
          accessibilityLabel="Save persona"
          style={({ pressed }) => [
            styles.button,
            styles.primaryButton,
            { backgroundColor: colors.primary },
            pressed && { opacity: 0.85 },
            saving && { opacity: 0.5 },
          ]}
        >
          <Text style={[styles.buttonText, { color: colors.primaryForeground }]}>Save persona</Text>
        </Pressable>
      </View>
    </View>
  );
}

function inputColors(colors: ReturnType<typeof useThemeColors>) {
  return { color: colors.foreground, borderColor: colors.border, backgroundColor: colors.background };
}

function Field({ label, hint, children }: { label: string; hint?: string; children: ReactNode }) {
  const colors = useThemeColors();
  return (
    <View style={styles.field}>
      <Text style={[styles.label, { color: colors.foreground }]}>{label}</Text>
      {children}
      {hint ? <Text style={[styles.hint, { color: colors.mutedForeground }]}>{hint}</Text> : null}
    </View>
  );
}

function SliderField({
  label,
  value,
  min,
  max,
  step,
  hint,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  hint: string;
  onChange: (value: number) => void;
}) {
  const colors = useThemeColors();
  return (
    <Field label={`${label}: ${value.toFixed(2)}`} hint={hint}>
      <Slider
        value={value}
        minimumValue={min}
        maximumValue={max}
        step={step}
        onValueChange={(next) => onChange(Math.round(next * 100) / 100)}
        minimumTrackTintColor={colors.primary}
        maximumTrackTintColor={colors.border}
        thumbTintColor={colors.primary}
        accessibilityLabel={label}
      />
    </Field>
  );
}

const styles = StyleSheet.create({
  stack: {
    gap: spacing.xl,
  },
  heading: {
    fontSize: 20,
    fontWeight: "700",
  },
  row: {
    flexDirection: "row",
    gap: spacing.md,
  },
  grow: {
    flex: 1,
  },
  field: {
    gap: spacing.sm,
  },
  label: {
    fontSize: 15,
    fontWeight: "600",
  },
  hint: {
    fontSize: 13,
    lineHeight: 18,
  },
  input: {
    borderWidth: 1,
    borderRadius: radius.lg,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    fontSize: 16,
  },
  avatarInput: {
    width: 72,
    textAlign: "center",
  },
  multiline: {
    minHeight: 84,
    textAlignVertical: "top",
  },
  promptInput: {
    minHeight: 160,
    textAlignVertical: "top",
  },
  error: {
    fontSize: 14,
    lineHeight: 20,
  },
  buttons: {
    flexDirection: "row",
    gap: spacing.md,
  },
  button: {
    flex: 1,
    height: 48,
    borderWidth: 1,
    borderColor: "transparent",
    borderRadius: radius.full,
    alignItems: "center",
    justifyContent: "center",
  },
  primaryButton: {
    borderColor: "transparent",
  },
  buttonText: {
    fontSize: 15,
    fontWeight: "600",
  },
});

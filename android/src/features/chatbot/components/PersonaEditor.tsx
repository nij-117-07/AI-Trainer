// src/features/chatbot/components/PersonaEditor.tsx
/** Form for creating or editing one persona. Validation runs before onSave is called. */
import { useState, type ReactNode } from "react";
import { StyleSheet, Text, View } from "react-native";
import Slider from "@react-native-community/slider";
import { SlidersHorizontal } from "lucide-react-native";
import { Disclosure } from "@/components/tool/Disclosure";
import { ActionButton, ErrorText, Field, TextField } from "@/components/tool/FormControls";
import { spacing, touchTarget, typeScale, useThemeColors } from "@/theme";
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

  const advancedChanged =
    draft.model.trim() !== "" ||
    draft.temperature !== EMPTY_PERSONA_DRAFT.temperature ||
    draft.topP !== EMPTY_PERSONA_DRAFT.topP ||
    draft.maxTokens !== EMPTY_PERSONA_DRAFT.maxTokens;
  const advancedSummary = `${draft.model.trim() || "Model from AI settings"} · Temperature ${draft.temperature.toFixed(2)} · Top P ${draft.topP.toFixed(2)}`;

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
      <Text accessibilityRole="header" style={[styles.heading, { color: colors.foreground }]}>
        {persona ? "Edit persona" : "New persona"}
      </Text>

      <View style={styles.row}>
        <TextField
          label="Avatar (optional)"
          value={draft.avatar}
          onChangeText={(value) => patch("avatar", value)}
          maxLength={PERSONA_LIMITS.avatarChars}
          style={styles.avatarInput}
        />
        <View style={styles.grow}>
          <TextField
            label="Name"
            value={draft.name}
            onChangeText={(value) => patch("name", value)}
            placeholder="Maths tutor"
            maxLength={PERSONA_LIMITS.nameChars}
            style={styles.singleLine}
          />
        </View>
      </View>

      <TextField
        label="Description (optional)"
        hint="Shown in the persona list and on an empty chat."
        value={draft.description}
        onChangeText={(value) => patch("description", value)}
        placeholder="Explains algebra step by step"
        maxLength={PERSONA_LIMITS.descriptionChars}
        multiline
      />

      <TextField
        label="System prompt (optional)"
        hint="Sent as the system message before every reply. This sets how the persona behaves."
        value={draft.systemPrompt}
        onChangeText={(value) => patch("systemPrompt", value)}
        placeholder="You are a patient maths tutor. Explain each step and check understanding."
        multiline
        style={styles.promptInput}
      />

      <TextField
        label="Starter prompts (optional)"
        hint="One per line, up to four. Shown on an empty chat."
        value={starterText}
        onChangeText={(value) => {
          setStarterText(value);
          setError(null);
        }}
        placeholder={"Explain quadratic equations\nCheck my working"}
        multiline
      />

      <Disclosure title="Advanced settings" icon={SlidersHorizontal} summary={advancedSummary} defaultOpen={advancedChanged}>
        <TextField
          label="Model (optional)"
          hint="Leave empty to use the chat model from AI settings."
          value={draft.model}
          onChangeText={(value) => patch("model", value)}
          placeholder="Chat model from AI settings"
          autoCapitalize="none"
          autoCorrect={false}
          style={styles.singleLine}
        />

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

        <TextField
          label="Max tokens (optional)"
          hint="Longest reply in tokens. 0 uses the provider default."
          value={maxTokensText}
          onChangeText={(value) => {
            setMaxTokensText(value.replace(/[^0-9]/g, ""));
            setError(null);
          }}
          keyboardType="number-pad"
          placeholder="0"
          style={styles.singleLine}
        />
      </Disclosure>

      <ErrorText message={error} />

      <View style={styles.buttons}>
        <View style={styles.buttonSlot}>
          <ActionButton label="Cancel" variant="outline" onPress={onCancel} disabled={saving} />
        </View>
        <View style={styles.buttonSlot}>
          <ActionButton
            label={saving ? "Saving persona…" : "Save persona"}
            loading={saving}
            onPress={() => void submit()}
          />
        </View>
      </View>
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
}): ReactNode {
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
        style={styles.slider}
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
    ...typeScale.headline,
  },
  row: {
    flexDirection: "row",
    gap: spacing.md,
  },
  grow: {
    flex: 1,
  },
  singleLine: {
    minHeight: 56,
  },
  avatarInput: {
    width: 72,
    minHeight: 56,
    textAlign: "center",
  },
  promptInput: {
    minHeight: 160,
  },
  slider: {
    height: touchTarget,
  },
  buttons: {
    flexDirection: "row",
    gap: spacing.md,
  },
  buttonSlot: {
    flex: 1,
  },
});

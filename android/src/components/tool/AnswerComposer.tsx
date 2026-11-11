// src/components/tool/AnswerComposer.tsx
/** Answer box pinned to a screen footer: text input, submit button, and voice input. */
import { ActivityIndicator, Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { shape, spacing, touchTarget, typeScale, useThemeColors } from "@/theme";
import { appendTranscript } from "@/features/chatbot/lib/voice-text";
import { ErrorText } from "./FormControls";
import { VoiceInputRow } from "./VoiceInputRow";

interface AnswerComposerProps {
  label: string;
  value: string;
  placeholder?: string;
  maxLength: number;
  pending: boolean;
  error: string | null;
  submitLabel: string;
  /** Shown beside the spinner while pending, for example "Checking…". */
  pendingLabel?: string;
  /** Lets an empty message submit, for modes where the text is optional. */
  allowEmpty?: boolean;
  onChangeText: (text: string) => void;
  onBlur?: () => void;
  onSubmit: () => void;
}

export function AnswerComposer({
  label,
  value,
  placeholder,
  maxLength,
  pending,
  error,
  submitLabel,
  pendingLabel,
  allowEmpty = false,
  onChangeText,
  onBlur,
  onSubmit,
}: AnswerComposerProps) {
  const colors = useThemeColors();
  const canSubmit = !pending && (allowEmpty || value.trim().length > 0);

  return (
    <View style={styles.wrap}>
      <ErrorText message={error} />

      <View style={styles.row}>
        <TextInput
          multiline
          value={value}
          onChangeText={onChangeText}
          onBlur={onBlur}
          editable={!pending}
          maxLength={maxLength}
          placeholder={placeholder}
          placeholderTextColor={colors.mutedForeground}
          accessibilityLabel={label}
          style={[styles.input, { color: colors.foreground, borderColor: colors.border, backgroundColor: colors.background }]}
        />
        <Pressable
          onPress={() => {
            if (canSubmit) onSubmit();
          }}
          disabled={!canSubmit}
          accessibilityRole="button"
          accessibilityLabel={submitLabel}
          accessibilityState={{ disabled: !canSubmit, busy: pending }}
          style={({ pressed }) => [
            styles.submit,
            { backgroundColor: canSubmit || pending ? colors.primary : colors.muted },
            pressed && canSubmit && { opacity: 0.85 },
          ]}
        >
          {pending ? <ActivityIndicator color={colors.primaryForeground} /> : null}
          <Text style={[styles.submitText, { color: canSubmit || pending ? colors.primaryForeground : colors.mutedForeground }]}>
            {pending ? pendingLabel ?? submitLabel : submitLabel}
          </Text>
        </Pressable>
      </View>

      <VoiceInputRow disabled={pending} onTranscript={(text) => onChangeText(appendTranscript(value, text))} />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    gap: spacing.sm,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  input: {
    flex: 1,
    minHeight: touchTarget,
    maxHeight: 120,
    borderWidth: 1,
    borderRadius: shape.lg,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    fontSize: 16,
  },
  submit: {
    minHeight: touchTarget,
    minWidth: 96,
    borderRadius: shape.lg,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: spacing.lg,
  },
  submitText: {
    ...typeScale.label,
    fontWeight: "600",
  },
});

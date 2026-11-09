// src/components/tool/AnswerComposer.tsx
/** Answer box pinned to a screen footer: text input, submit button, and voice input. */
import { ActivityIndicator, Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { radius, spacing, useThemeColors } from "@/theme";
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
  onChangeText: (text: string) => void;
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
  onChangeText,
  onSubmit,
}: AnswerComposerProps) {
  const colors = useThemeColors();
  const canSubmit = !pending && value.trim().length > 0;

  return (
    <View style={styles.wrap}>
      <ErrorText message={error} />

      <View style={styles.row}>
        <TextInput
          multiline
          value={value}
          onChangeText={onChangeText}
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
          {pending ? (
            <ActivityIndicator color={colors.primaryForeground} />
          ) : (
            <Text style={[styles.submitText, { color: canSubmit ? colors.primaryForeground : colors.mutedForeground }]}>
              {submitLabel}
            </Text>
          )}
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
    minHeight: 48,
    maxHeight: 120,
    borderWidth: 1,
    borderRadius: radius.lg,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    fontSize: 16,
  },
  submit: {
    minHeight: 48,
    minWidth: 96,
    borderRadius: radius.lg,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: spacing.lg,
  },
  submitText: {
    fontSize: 15,
    fontWeight: "600",
  },
});

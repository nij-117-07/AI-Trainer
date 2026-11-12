// src/components/tool/AnswerComposer.tsx
/** Answer box pinned to a screen footer: text input, submit button, and voice input. */
import { useState } from "react";
import { ActivityIndicator, Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import type { LucideIcon } from "lucide-react-native";
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
  /**
   * With "inline" (default) the submit is icon-only. With "below" it sits on its own full-width row
   * under the input and shows the icon beside submitLabel.
   */
  submitIcon?: LucideIcon;
  submitPlacement?: "inline" | "below";
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
  submitIcon: SubmitIcon,
  submitPlacement = "inline",
  pendingLabel,
  allowEmpty = false,
  onChangeText,
  onBlur,
  onSubmit,
}: AnswerComposerProps) {
  const colors = useThemeColors();
  const [voiceError, setVoiceError] = useState<string | null>(null);
  const canSubmit = !pending && (allowEmpty || value.trim().length > 0);
  const submitTone = canSubmit || pending ? colors.primaryForeground : colors.mutedForeground;
  const iconOnly = SubmitIcon !== undefined && submitPlacement === "inline";

  const submit = (
    <Pressable
      onPress={() => {
        if (canSubmit) onSubmit();
      }}
      disabled={!canSubmit}
      accessibilityRole="button"
      accessibilityLabel={submitLabel}
      accessibilityState={{ disabled: !canSubmit, busy: pending }}
      style={({ pressed }) => [
        iconOnly ? styles.iconSubmit : submitPlacement === "below" ? styles.belowSubmit : styles.submit,
        { backgroundColor: canSubmit || pending ? colors.primary : colors.muted },
        pressed && canSubmit && { opacity: 0.85 },
      ]}
    >
      {iconOnly ? (
        pending ? (
          <ActivityIndicator color={colors.primaryForeground} />
        ) : (
          <SubmitIcon size={20} color={submitTone} />
        )
      ) : (
        <>
          {pending ? (
            <ActivityIndicator color={colors.primaryForeground} />
          ) : SubmitIcon ? (
            <SubmitIcon size={18} color={submitTone} />
          ) : null}
          <Text style={[styles.submitText, { color: submitTone }]}>
            {pending ? pendingLabel ?? submitLabel : submitLabel}
          </Text>
        </>
      )}
    </Pressable>
  );

  return (
    <View style={styles.wrap}>
      <ErrorText message={error ?? voiceError} />

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
        <VoiceInputRow
          compact
          disabled={pending}
          onError={setVoiceError}
          onTranscript={(text) => onChangeText(appendTranscript(value, text))}
        />
        {submitPlacement === "inline" && submit}
      </View>
      {submitPlacement === "below" && submit}
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
  belowSubmit: {
    minHeight: touchTarget,
    borderRadius: shape.lg,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
  },
  iconSubmit: {
    width: touchTarget,
    height: touchTarget,
    borderRadius: shape.full,
    alignItems: "center",
    justifyContent: "center",
  },
  submitText: {
    ...typeScale.label,
    fontWeight: "600",
  },
});

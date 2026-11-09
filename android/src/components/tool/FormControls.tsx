// src/components/tool/FormControls.tsx
/**
 * Shared form and layout controls for the Testing Portal tabs.
 */
import type { ReactNode } from "react";
import { ActivityIndicator, Pressable, StyleSheet, Text, TextInput, View, type TextInputProps } from "react-native";
import type { LucideIcon } from "lucide-react-native";
import { radius, spacing, useThemeColors } from "@/theme";
import { appendTranscript } from "@/features/chatbot/lib/voice-text";
import { VoiceInputRow } from "./VoiceInputRow";

export function Panel({ children }: { children: ReactNode }) {
  const colors = useThemeColors();
  return <View style={[styles.panel, { backgroundColor: colors.card, borderColor: colors.border }]}>{children}</View>;
}

export function Field({ label, hint, children }: { label: string; hint?: string; children: ReactNode }) {
  const colors = useThemeColors();
  return (
    <View style={styles.field}>
      <Text style={[styles.label, { color: colors.foreground }]}>{label}</Text>
      {children}
      {hint ? <Text style={[styles.hint, { color: colors.mutedForeground }]}>{hint}</Text> : null}
    </View>
  );
}

interface TextFieldProps extends TextInputProps {
  label: string;
  hint?: string;
  voice?: boolean;
}

export function TextField({ label, hint, multiline = false, voice = false, style, ...inputProps }: TextFieldProps) {
  const colors = useThemeColors();
  const { value, onChangeText, editable } = inputProps;
  return (
    <Field label={label} hint={hint}>
      <TextInput
        placeholderTextColor={colors.mutedForeground}
        multiline={multiline}
        textAlignVertical={multiline ? "top" : "center"}
        blurOnSubmit={!multiline}
        returnKeyType={multiline ? "default" : "done"}
        style={[
          styles.input,
          multiline && styles.multiline,
          { color: colors.foreground, borderColor: colors.border, backgroundColor: colors.background },
          style,
        ]}
        {...inputProps}
      />
      {voice ? (
        <VoiceInputRow
          disabled={editable === false}
          onTranscript={(text) => onChangeText?.(appendTranscript(value ?? "", text))}
        />
      ) : null}
    </Field>
  );
}

interface ChoiceOption<T extends string | number> {
  value: T;
  label: string;
}

interface ChoiceChipsProps<T extends string | number> {
  options: ChoiceOption<T>[];
  value: T;
  onChange: (value: T) => void;
  wrap?: boolean;
}

export function ChoiceChips<T extends string | number>({ options, value, onChange, wrap = true }: ChoiceChipsProps<T>) {
  const colors = useThemeColors();
  return (
    <View style={[styles.chips, wrap && styles.chipsWrap]}>
      {options.map((option) => {
        const selected = option.value === value;
        return (
          <Pressable
            key={String(option.value)}
            onPress={() => onChange(option.value)}
            accessibilityRole="button"
            accessibilityState={{ selected }}
            style={[
              styles.chip,
              {
                borderColor: selected ? colors.primary : colors.border,
                backgroundColor: selected ? colors.primary : colors.card,
              },
            ]}
          >
            <Text style={[styles.chipText, { color: selected ? colors.primaryForeground : colors.foreground }]}>
              {option.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

interface ActionButtonProps {
  label: string;
  icon?: LucideIcon;
  onPress: () => void;
  loading?: boolean;
  variant?: "primary" | "outline";
  disabled?: boolean;
}

export function ActionButton({ label, icon: Icon, onPress, loading = false, variant = "primary", disabled = false }: ActionButtonProps) {
  const colors = useThemeColors();
  const filled = variant === "primary";
  const foreground = filled ? colors.primaryForeground : colors.foreground;
  const inactive = loading || disabled;
  return (
    <Pressable
      onPress={onPress}
      disabled={inactive}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ busy: loading, disabled: inactive }}
      style={({ pressed }) => [
        styles.button,
        filled
          ? { backgroundColor: colors.primary }
          : { borderWidth: 1, borderColor: colors.border, backgroundColor: colors.card },
        pressed && styles.pressed,
        inactive && styles.disabled,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={foreground} />
      ) : Icon ? (
        <Icon size={18} color={foreground} />
      ) : null}
      <Text style={[styles.buttonText, { color: foreground }]}>{label}</Text>
    </Pressable>
  );
}

export function ErrorText({ message }: { message: string | null }) {
  const colors = useThemeColors();
  if (!message) return null;
  return (
    <Text accessibilityRole="alert" style={[styles.error, { color: colors.destructive }]}>
      {message}
    </Text>
  );
}

const styles = StyleSheet.create({
  panel: {
    borderWidth: 1,
    borderRadius: radius.xl,
    padding: spacing.xl,
    gap: spacing.lg,
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
  multiline: {
    minHeight: 110,
  },
  chips: {
    flexDirection: "row",
    gap: spacing.sm,
  },
  chipsWrap: {
    flexWrap: "wrap",
  },
  chip: {
    borderWidth: 1,
    borderRadius: radius.full,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    minHeight: 44,
    justifyContent: "center",
  },
  chipText: {
    fontSize: 14,
    fontWeight: "500",
  },
  button: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm,
    minHeight: 50,
    borderRadius: radius.full,
    paddingHorizontal: spacing.xl,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: "600",
  },
  pressed: {
    opacity: 0.85,
  },
  disabled: {
    opacity: 0.6,
  },
  error: {
    fontSize: 14,
    lineHeight: 20,
  },
});

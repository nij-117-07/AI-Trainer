// src/features/simulator/components/ChatComposer.tsx
/** Multiline message box with a send button. Send is disabled while the line is empty or a reply is pending. */
import { ActivityIndicator, Pressable, StyleSheet, TextInput, View } from "react-native";
import { Send } from "lucide-react-native";
import { radius, spacing, useThemeColors } from "@/theme";

interface ChatComposerProps {
  value: string;
  onChangeText: (value: string) => void;
  onSend: () => void;
  pending: boolean;
  placeholder?: string;
}

export function ChatComposer({ value, onChangeText, onSend, pending, placeholder }: ChatComposerProps) {
  const colors = useThemeColors();
  const canSend = value.trim().length > 0 && !pending;

  return (
    <View style={styles.row}>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.mutedForeground}
        multiline
        editable={!pending}
        maxLength={2000}
        textAlignVertical="top"
        style={[styles.input, { color: colors.foreground, borderColor: colors.border, backgroundColor: colors.background }]}
      />
      <Pressable
        onPress={onSend}
        disabled={!canSend}
        accessibilityRole="button"
        accessibilityLabel="Send message"
        accessibilityState={{ disabled: !canSend, busy: pending }}
        style={({ pressed }) => [
          styles.send,
          { backgroundColor: colors.primary },
          !canSend && styles.disabled,
          pressed && canSend && styles.pressed,
        ]}
      >
        {pending ? (
          <ActivityIndicator color={colors.primaryForeground} />
        ) : (
          <Send size={18} color={colors.primaryForeground} />
        )}
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: spacing.sm,
  },
  input: {
    flex: 1,
    minHeight: 50,
    maxHeight: 140,
    borderWidth: 1,
    borderRadius: radius.lg,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    fontSize: 16,
  },
  send: {
    width: 50,
    height: 50,
    borderRadius: radius.full,
    alignItems: "center",
    justifyContent: "center",
  },
  disabled: {
    opacity: 0.5,
  },
  pressed: {
    opacity: 0.85,
  },
});

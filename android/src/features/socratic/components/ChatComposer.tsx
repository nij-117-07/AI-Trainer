// src/features/socratic/components/ChatComposer.tsx
/**
 * Message box pinned to the bottom of the discussion. Voice input and send sit inside the box, with
 * send on the right. On web, Enter sends and Shift+Enter adds a line; Enter is ignored while an input
 * method is composing text.
 */
import { Platform, Pressable, StyleSheet, Text, TextInput, View, type TextInputKeyPressEvent } from "react-native";
import { ArrowUp, Square } from "lucide-react-native";
import { shape, spacing, touchTarget, typeScale, useLayout, useThemeColors } from "@/theme";
import { appendTranscript } from "@/features/chatbot/lib/voice-text";
import { ErrorText, pointerCursor } from "@/components/tool/FormControls";
import { VoiceInputRow } from "@/components/tool/VoiceInputRow";
import { STATEMENT_MAX } from "../options";

interface ChatComposerProps {
  value: string;
  placeholder: string;
  pending: boolean;
  error: string | null;
  onChangeText: (text: string) => void;
  onSend: () => void;
  onStop: () => void;
}

export function ChatComposer({ value, placeholder, pending, error, onChangeText, onSend, onStop }: ChatComposerProps) {
  const colors = useThemeColors();
  const { size } = useLayout();
  const canSend = !pending && value.trim().length > 0;
  const canRetry = !pending && !!error && value.trim().length > 0;
  const showHint = Platform.OS === "web" || size !== "phone";

  const onKeyPress = (event: TextInputKeyPressEvent) => {
    const native = event.nativeEvent as TextInputKeyPressEvent["nativeEvent"] & { shiftKey?: boolean; isComposing?: boolean };
    if (Platform.OS !== "web" || native.key !== "Enter" || native.shiftKey || native.isComposing) return;
    (event as TextInputKeyPressEvent & { preventDefault?: () => void }).preventDefault?.();
    if (canSend) onSend();
  };

  return (
    <View style={styles.wrap}>
      {error ? (
        <View style={styles.errorRow}>
          <ErrorText message={error} />
          {canRetry ? (
            <Pressable
              onPress={onSend}
              accessibilityRole="button"
              accessibilityLabel="Retry sending message"
              style={({ pressed }) => [styles.retry, pointerCursor, pressed && styles.pressed]}
            >
              <Text style={[styles.retryText, { color: colors.primary }]}>Retry</Text>
            </Pressable>
          ) : null}
        </View>
      ) : null}

      <View style={[styles.box, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <TextInput
          multiline
          value={value}
          onChangeText={onChangeText}
          onKeyPress={onKeyPress}
          editable={!pending}
          maxLength={STATEMENT_MAX}
          placeholder={placeholder}
          placeholderTextColor={colors.mutedForeground}
          accessibilityLabel="Message to the challenger"
          style={[styles.input, { color: colors.foreground }]}
        />

        <VoiceInputRow disabled={pending} onTranscript={(text) => onChangeText(appendTranscript(value, text))} />

        {pending ? (
          <Pressable
            onPress={onStop}
            accessibilityRole="button"
            accessibilityLabel="Stop generating"
            style={({ pressed }) => [styles.send, pointerCursor, { backgroundColor: colors.foreground }, pressed && styles.pressed]}
          >
            <Square size={18} color={colors.background} fill={colors.background} />
          </Pressable>
        ) : (
          <Pressable
            onPress={onSend}
            disabled={!canSend}
            accessibilityRole="button"
            accessibilityLabel="Send message"
            accessibilityState={{ disabled: !canSend }}
            style={({ pressed }) => [
              styles.send,
              pointerCursor,
              { backgroundColor: colors.primary },
              !canSend && styles.dimmed,
              pressed && canSend && styles.pressed,
            ]}
          >
            <ArrowUp size={22} color={colors.primaryForeground} />
          </Pressable>
        )}
      </View>

      {showHint ? <Text style={[styles.hint, { color: colors.mutedForeground }]}>Enter to send, Shift+Enter for a new line</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    gap: spacing.xs,
  },
  errorRow: {
    gap: spacing.xs,
    alignItems: "flex-start",
  },
  retry: {
    minHeight: touchTarget,
    justifyContent: "center",
    paddingHorizontal: spacing.sm,
  },
  retryText: {
    ...typeScale.label,
    fontWeight: "600",
  },
  box: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: spacing.xs,
    borderWidth: 1,
    borderRadius: shape.lg,
    padding: spacing.sm,
  },
  input: {
    flex: 1,
    minHeight: touchTarget,
    maxHeight: 200,
    paddingLeft: spacing.sm,
    paddingRight: spacing.xs,
    paddingVertical: spacing.md,
    textAlignVertical: "center",
    ...typeScale.body,
  },
  send: {
    width: touchTarget,
    height: touchTarget,
    borderRadius: shape.full,
    alignItems: "center",
    justifyContent: "center",
  },
  dimmed: {
    opacity: 0.4,
  },
  pressed: {
    opacity: 0.85,
  },
  hint: {
    ...typeScale.caption,
    paddingHorizontal: spacing.xs,
  },
});

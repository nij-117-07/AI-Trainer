// src/features/tutor-chat/components/ChatComposer.tsx
/**
 * Message box with voice input and a send button. Send is disabled while the input is empty or a
 * reply is pending. On web, Enter sends and Shift+Enter adds a line, except while an IME is composing.
 */
import { ActivityIndicator, Platform, Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { Send } from "lucide-react-native";
import { shape, spacing, touchTarget, typeScale, useThemeColors } from "@/theme";
import { VoiceInputRow } from "@/components/tool/VoiceInputRow";
import { appendTranscript } from "@/features/chatbot/lib/voice-text";

interface ChatComposerProps {
  value: string;
  onChangeText: (value: string) => void;
  onSend: () => void;
  pending: boolean;
  placeholder?: string;
}

/** The DOM keyboard event that react-native-web passes to onKeyPress. */
interface WebKeyEvent {
  key: string;
  shiftKey: boolean;
  isComposing?: boolean;
  keyCode?: number;
  preventDefault: () => void;
}

const IME_KEY_CODE = 229;

export function ChatComposer({ value, onChangeText, onSend, pending, placeholder }: ChatComposerProps) {
  const colors = useThemeColors();
  const canSend = value.trim().length > 0 && !pending;

  function handleKeyPress(event: unknown) {
    const key = event as WebKeyEvent;
    if (key.key !== "Enter" || key.shiftKey || key.isComposing || key.keyCode === IME_KEY_CODE) return;
    key.preventDefault();
    if (canSend) onSend();
  }

  return (
    <View style={styles.wrap}>
      <View style={[styles.box, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={colors.mutedForeground}
          accessibilityLabel="Message the tutor"
          multiline
          editable={!pending}
          textAlignVertical="top"
          onKeyPress={Platform.OS === "web" ? handleKeyPress : undefined}
          style={[styles.input, typeScale.body, { color: colors.foreground }]}
        />
        <View style={styles.voice}>
          <VoiceInputRow
            disabled={pending}
            onTranscript={(text) => onChangeText(appendTranscript(value, text))}
          />
        </View>
        <Pressable
          onPress={onSend}
          disabled={!canSend}
          accessibilityRole="button"
          accessibilityLabel={pending ? "Waiting for the tutor" : "Send message"}
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
            <Send size={20} color={colors.primaryForeground} />
          )}
        </Pressable>
      </View>
      {Platform.OS === "web" ? (
        <Text style={[styles.hint, { color: colors.mutedForeground }]}>Enter to send, Shift+Enter for a new line</Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    gap: spacing.xs,
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
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
  },
  voice: {
    width: touchTarget,
  },
  send: {
    width: touchTarget,
    height: touchTarget,
    borderRadius: shape.full,
    alignItems: "center",
    justifyContent: "center",
  },
  disabled: {
    opacity: 0.4,
  },
  pressed: {
    borderRadius: shape.lg,
  },
  hint: {
    ...typeScale.caption,
    paddingHorizontal: spacing.sm,
  },
});

// src/features/roleplay/components/RoleplayComposer.tsx
/**
 * Message box pinned to the bottom of the chat. Voice input and send sit inside the box. On web,
 * Enter sends and Shift+Enter adds a line; Enter is ignored while an input method is composing.
 */
import { Platform, Pressable, StyleSheet, Text, TextInput, View, type TextInputKeyPressEvent } from "react-native";
import { ArrowUp, Square } from "lucide-react-native";
import { shape, spacing, touchTarget, typeScale, useLayout, useThemeColors } from "@/theme";
import { appendTranscript } from "@/features/chatbot/lib/voice-text";
import { pointerCursor } from "@/components/tool/FormControls";
import { VoiceInputRow } from "@/components/tool/VoiceInputRow";
import { MESSAGE_MAX } from "../options";

const IME_KEY_CODE = 229;

interface RoleplayComposerProps {
  value: string;
  onChangeText: (value: string) => void;
  onSend: () => void;
  onStop: () => void;
  pending: boolean;
}

export function RoleplayComposer({ value, onChangeText, onSend, onStop, pending }: RoleplayComposerProps) {
  const colors = useThemeColors();
  const { size } = useLayout();
  const canSend = value.trim().length > 0 && !pending;
  const showHint = Platform.OS === "web" || size !== "phone";

  const onKeyPress = (event: TextInputKeyPressEvent) => {
    const native = event.nativeEvent as TextInputKeyPressEvent["nativeEvent"] & {
      shiftKey?: boolean;
      isComposing?: boolean;
      keyCode?: number;
    };
    if (
      Platform.OS !== "web" ||
      native.key !== "Enter" ||
      native.shiftKey ||
      native.isComposing ||
      native.keyCode === IME_KEY_CODE
    ) {
      return;
    }
    (event as TextInputKeyPressEvent & { preventDefault?: () => void }).preventDefault?.();
    if (canSend) onSend();
  };

  return (
    <View style={styles.wrap}>
      <View style={[styles.box, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <TextInput
          value={value}
          onChangeText={onChangeText}
          onKeyPress={onKeyPress}
          editable={!pending}
          maxLength={MESSAGE_MAX}
          multiline
          placeholder="Say something in character…"
          placeholderTextColor={colors.mutedForeground}
          accessibilityLabel="Your message"
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

      {showHint ? (
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

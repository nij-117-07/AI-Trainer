// src/features/roleplay/components/RoleplayComposer.tsx
/** Multiline message box with a send button. Send is disabled while the draft is empty or a reply is pending. */
import { ActivityIndicator, Pressable, StyleSheet, TextInput, View } from "react-native";
import { Send } from "lucide-react-native";
import { radius, spacing, useThemeColors } from "@/theme";
import { appendTranscript } from "@/features/chatbot/lib/voice-text";
import { VoiceInputRow } from "@/components/tool/VoiceInputRow";
import { MESSAGE_MAX } from "../options";

interface RoleplayComposerProps {
  value: string;
  onChangeText: (value: string) => void;
  onSend: () => void;
  pending: boolean;
}

export function RoleplayComposer({ value, onChangeText, onSend, pending }: RoleplayComposerProps) {
  const colors = useThemeColors();
  const canSend = value.trim().length > 0 && !pending;

  return (
    <View style={styles.wrap}>
      <View style={styles.row}>
        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder="Say something in character…"
          placeholderTextColor={colors.mutedForeground}
          multiline
          maxLength={MESSAGE_MAX}
          editable={!pending}
          textAlignVertical="top"
          accessibilityLabel="Your message"
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
      <VoiceInputRow
        disabled={pending}
        onTranscript={(text) => onChangeText(appendTranscript(value, text))}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    gap: spacing.sm,
  },
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

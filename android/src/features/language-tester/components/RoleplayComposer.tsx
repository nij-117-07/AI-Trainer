// src/features/language-tester/components/RoleplayComposer.tsx
/** Message box pinned to the bottom of the roleplay: the line field, voice input, and an icon-only send. */
import { ActivityIndicator, Pressable, StyleSheet, TextInput, View } from "react-native";
import { Send } from "lucide-react-native";
import { shape, spacing, touchTarget, typeScale, useThemeColors } from "@/theme";
import { VoiceInputRow } from "@/components/tool/VoiceInputRow";
import { appendTranscript } from "@/features/chatbot/lib/voice-text";

interface RoleplayComposerProps {
  value: string;
  pending: boolean;
  onChangeText: (text: string) => void;
  onSend: () => void;
}

export function RoleplayComposer({ value, pending, onChangeText, onSend }: RoleplayComposerProps) {
  const colors = useThemeColors();
  const canSend = !pending && value.trim() !== "";

  return (
    <View style={[styles.composer, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <TextInput
        multiline
        value={value}
        onChangeText={onChangeText}
        editable={!pending}
        maxLength={2000}
        placeholder="Deliver your next line…"
        placeholderTextColor={colors.mutedForeground}
        accessibilityLabel="Your line"
        style={[styles.input, { color: colors.foreground }]}
      />
      <VoiceInputRow disabled={pending} onTranscript={(text) => onChangeText(appendTranscript(value, text))} />
      <Pressable
        onPress={() => {
          if (canSend) onSend();
        }}
        disabled={!canSend}
        accessibilityRole="button"
        accessibilityLabel={pending ? "Waiting for reply" : "Send line"}
        accessibilityState={{ busy: pending, disabled: !canSend }}
        style={({ pressed }) => [
          styles.send,
          { backgroundColor: colors.primary, opacity: canSend ? 1 : 0.4 },
          pressed && canSend && { opacity: 0.85 },
        ]}
      >
        {pending ? (
          <ActivityIndicator color={colors.primaryForeground} />
        ) : (
          <Send size={20} color={colors.primaryForeground} />
        )}
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  composer: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: spacing.sm,
    borderWidth: 1,
    borderRadius: shape.lg,
    padding: spacing.sm,
  },
  input: {
    flex: 1,
    minHeight: touchTarget,
    maxHeight: 200,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    ...typeScale.body,
  },
  send: {
    width: touchTarget,
    height: touchTarget,
    borderRadius: shape.full,
    alignItems: "center",
    justifyContent: "center",
  },
});

// src/features/chatbot/components/Composer.tsx
/**
 * Message box at the bottom of the chat. The mic records voice input, the send button sends the
 * message, and the stop button ends a reply that is streaming.
 */
import { ActivityIndicator, Platform, Pressable, StyleSheet, Text, TextInput, View, type TextInputKeyPressEvent } from "react-native";
import { ArrowUp, Mic, Square } from "lucide-react-native";
import { radius, spacing, useThemeColors } from "@/theme";
import { pointerCursor } from "@/components/tool/FormControls";

export interface VoiceControls {
  ready: boolean;
  recording: boolean;
  transcribing: boolean;
  onToggle: () => void;
}

interface ComposerProps {
  value: string;
  onChangeText: (value: string) => void;
  onSend: () => void;
  onStop: () => void;
  sending: boolean;
  placeholder: string;
  voice: VoiceControls;
}

export function Composer({ value, onChangeText, onSend, onStop, sending, placeholder, voice }: ComposerProps) {
  const colors = useThemeColors();
  const canSend = value.trim().length > 0;
  const micLabel = voice.recording ? "Stop recording" : "Start voice input";

  const onKeyPress = (event: TextInputKeyPressEvent) => {
    const native = event.nativeEvent as TextInputKeyPressEvent["nativeEvent"] & { shiftKey?: boolean; isComposing?: boolean };
    if (Platform.OS !== "web" || native.key !== "Enter" || native.shiftKey || native.isComposing) return;
    (event as TextInputKeyPressEvent & { preventDefault?: () => void }).preventDefault?.();
    if (canSend && !sending) onSend();
  };

  return (
    <View style={styles.wrap}>
      <View style={[styles.box, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <TextInput
          value={value}
          onChangeText={onChangeText}
          onKeyPress={onKeyPress}
          placeholder={placeholder}
          placeholderTextColor={colors.mutedForeground}
          multiline
          textAlignVertical="top"
          accessibilityLabel="Message"
          style={[styles.input, { color: colors.foreground }]}
        />

        <Pressable
          onPress={voice.onToggle}
          disabled={voice.transcribing}
          accessibilityRole="button"
          accessibilityLabel={micLabel}
          accessibilityState={{ busy: voice.transcribing, selected: voice.recording }}
          style={({ pressed }) => [
            styles.round,
            pointerCursor,
            { backgroundColor: voice.recording ? colors.destructive : colors.muted },
            pressed && styles.pressed,
          ]}
        >
          {voice.transcribing ? (
            <ActivityIndicator size="small" color={colors.foreground} />
          ) : voice.recording ? (
            <Square size={14} color={colors.background} fill={colors.background} />
          ) : (
            <Mic size={18} color={voice.ready ? colors.foreground : colors.mutedForeground} />
          )}
        </Pressable>

        {sending ? (
          <Pressable
            onPress={onStop}
            accessibilityRole="button"
            accessibilityLabel="Stop reply"
            style={({ pressed }) => [
              styles.round,
              pointerCursor,
              { backgroundColor: colors.foreground },
              pressed && styles.pressed,
            ]}
          >
            <Square size={14} color={colors.background} fill={colors.background} />
          </Pressable>
        ) : (
          <Pressable
            onPress={onSend}
            disabled={!canSend}
            accessibilityRole="button"
            accessibilityLabel="Send message"
            accessibilityState={{ disabled: !canSend }}
            style={({ pressed }) => [
              styles.round,
              pointerCursor,
              { backgroundColor: colors.primary },
              !canSend && styles.disabled,
              pressed && canSend && styles.pressed,
            ]}
          >
            <ArrowUp size={18} color={colors.primaryForeground} />
          </Pressable>
        )}
      </View>

      {Platform.OS === "web" ? (
        <Text style={[styles.hint, { color: colors.mutedForeground }]}>Enter to send. Shift+Enter for a new line.</Text>
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
    gap: spacing.sm,
    borderWidth: 1,
    borderRadius: radius["2xl"],
    paddingLeft: spacing.lg,
    paddingRight: spacing.xs,
    paddingVertical: spacing.xs,
  },
  input: {
    flex: 1,
    minHeight: 44,
    maxHeight: 160,
    fontSize: 16,
    paddingVertical: spacing.md,
  },
  round: {
    width: 44,
    height: 44,
    borderRadius: radius.full,
    alignItems: "center",
    justifyContent: "center",
  },
  disabled: {
    opacity: 0.4,
  },
  pressed: {
    opacity: 0.85,
  },
  hint: {
    fontSize: 12,
    textAlign: "center",
  },
});

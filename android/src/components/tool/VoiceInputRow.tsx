// src/components/tool/VoiceInputRow.tsx
/**
 * Mic button for a text field. Each recording is transcribed with the voice model in AI settings
 * and handed to onTranscript, so the caller can append it to what is already typed.
 */
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from "react-native";
import { Mic, Square } from "lucide-react-native";
import { radius, spacing, useThemeColors } from "@/theme";
import { useVoiceInput } from "@/features/chatbot/hooks/useVoiceInput";
import { formatElapsed } from "@/features/chatbot/lib/voice-text";

interface VoiceInputRowProps {
  onTranscript: (text: string) => void;
  disabled?: boolean;
}

export function VoiceInputRow({ onTranscript, disabled = false }: VoiceInputRowProps) {
  const colors = useThemeColors();
  const voice = useVoiceInput(onTranscript);
  const locked = disabled || voice.transcribing;

  return (
    <View style={styles.wrap}>
      <View style={styles.row}>
        <Pressable
          onPress={() => void voice.toggle()}
          disabled={locked}
          accessibilityRole="button"
          accessibilityLabel={voice.recording ? "Stop recording" : "Start voice input"}
          accessibilityState={{ busy: voice.transcribing, selected: voice.recording, disabled: locked }}
          style={({ pressed }) => [
            styles.micButton,
            { backgroundColor: voice.recording ? colors.destructive : colors.muted },
            pressed && styles.pressed,
            locked && styles.disabled,
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
        <Text style={[styles.status, { color: voice.recording ? colors.destructive : colors.mutedForeground }]}>
          {voiceStatus(voice.recording, voice.transcribing, voice.ready, voice.elapsedMs)}
        </Text>
      </View>
      {voice.error ? (
        <Text accessibilityRole="alert" style={[styles.error, { color: colors.destructive }]}>
          {voice.error}
        </Text>
      ) : null}
    </View>
  );
}

function voiceStatus(recording: boolean, transcribing: boolean, ready: boolean, elapsedMs: number): string {
  if (recording) return `Recording ${formatElapsed(elapsedMs)}. Tap the red button to finish.`;
  if (transcribing) return "Transcribing your voice…";
  if (!ready) return "Add the voice model in AI settings to speak your answer.";
  return "Speak instead of typing";
}

const styles = StyleSheet.create({
  wrap: {
    gap: spacing.xs,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
  },
  micButton: {
    width: 44,
    height: 44,
    borderRadius: radius.full,
    alignItems: "center",
    justifyContent: "center",
  },
  status: {
    flex: 1,
    fontSize: 13,
    lineHeight: 18,
  },
  error: {
    fontSize: 14,
    lineHeight: 20,
  },
  pressed: {
    opacity: 0.85,
  },
  disabled: {
    opacity: 0.5,
  },
});

// src/components/tool/VoiceInputRow.tsx
/**
 * Mic button for a text field. Icon only: the label and hint carry the state for screen readers, and
 * the colour and icon show it on screen. Each recording is transcribed with the voice model in AI
 * settings and handed to onTranscript, so the caller can append it to what is already typed.
 */
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from "react-native";
import { Mic, Square } from "lucide-react-native";
import { shape, spacing, touchTarget, typeScale, useThemeColors } from "@/theme";
import { useVoiceInput } from "@/features/chatbot/hooks/useVoiceInput";

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
      <Pressable
        onPress={() => void voice.toggle()}
        disabled={locked}
        accessibilityRole="button"
        accessibilityLabel={voice.recording ? "Stop recording" : "Start voice input"}
        accessibilityHint={voiceHint(voice.ready)}
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
          <Square size={18} color={colors.background} fill={colors.background} />
        ) : (
          <Mic size={22} color={voice.ready ? colors.foreground : colors.mutedForeground} />
        )}
      </Pressable>
      {voice.error ? (
        <Text accessibilityRole="alert" style={[styles.error, { color: colors.destructive }]}>
          {voice.error}
        </Text>
      ) : null}
    </View>
  );
}

function voiceHint(ready: boolean): string {
  return ready ? "Speak instead of typing" : "Add the voice model in AI settings to speak your answer";
}

const styles = StyleSheet.create({
  wrap: {
    gap: spacing.xs,
    alignItems: "flex-start",
  },
  micButton: {
    width: touchTarget,
    height: touchTarget,
    borderRadius: shape.full,
    alignItems: "center",
    justifyContent: "center",
  },
  error: {
    ...typeScale.label,
    fontWeight: "400",
  },
  pressed: {
    opacity: 0.85,
  },
  disabled: {
    opacity: 0.5,
  },
});

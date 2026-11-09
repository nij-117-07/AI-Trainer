// src/components/tool/ListenButton.tsx
/**
 * Reads a piece of generated text aloud with the speech model in AI settings. Tap again to stop.
 * Audio is kept while the button is mounted, so replaying the same text does not regenerate it.
 */
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from "react-native";
import { Square, Volume2 } from "lucide-react-native";
import { radius, spacing, useThemeColors } from "@/theme";
import { useReplySpeech } from "@/features/chatbot/hooks/useReplySpeech";
import { ErrorText } from "./FormControls";

interface ListenButtonProps {
  text: string;
  label?: string;
}

export function ListenButton({ text, label = "Listen" }: ListenButtonProps) {
  const colors = useThemeColors();
  const speech = useReplySpeech();
  const spoken = text.trim();
  const plain = toSpeakableText(spoken);
  if (plain === "") return null;

  const loading = speech.loadingId === spoken;
  const playing = speech.activeId === spoken && !loading;
  const stopping = loading || playing;

  return (
    <View style={styles.wrap}>
      <Pressable
        onPress={() => {
          if (stopping) speech.stop();
          else void speech.speak(spoken, plain);
        }}
        accessibilityRole="button"
        accessibilityLabel={stopping ? `Stop reading ${label.toLowerCase()}` : `Listen ${label.toLowerCase()}`}
        style={({ pressed }) => [styles.button, { borderColor: colors.border }, pressed && { backgroundColor: colors.muted }]}
      >
        {loading ? (
          <ActivityIndicator size="small" color={colors.foreground} />
        ) : playing ? (
          <Square size={14} color={colors.primary} fill={colors.primary} />
        ) : (
          <Volume2 size={16} color={colors.foreground} />
        )}
        <Text style={[styles.text, { color: colors.foreground }]}>{loading ? "Loading" : playing ? "Stop" : label}</Text>
      </Pressable>
      <ErrorText message={speech.error} />
    </View>
  );
}

function toSpeakableText(markdown: string): string {
  return markdown
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/^\s*(?:[-+*]|\d+\.)\s+/gm, "")
    .replace(/[`*_#>|~]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

const styles = StyleSheet.create({
  wrap: {
    gap: spacing.xs,
  },
  button: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    gap: spacing.xs,
    minHeight: 44,
    borderWidth: 1,
    borderRadius: radius.full,
    paddingHorizontal: spacing.md,
  },
  text: {
    fontSize: 14,
    fontWeight: "600",
  },
});

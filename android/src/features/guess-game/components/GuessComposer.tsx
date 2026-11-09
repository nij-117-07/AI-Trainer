// src/features/guess-game/components/GuessComposer.tsx
/** Guess input and actions pinned to the screen footer, so they stay in reach while the transcript scrolls. */
import { useState } from "react";
import { ActivityIndicator, Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { LifeBuoy, Sparkles } from "lucide-react-native";
import type { LucideIcon } from "lucide-react-native";
import { radius, spacing, useThemeColors } from "@/theme";
import { ErrorText } from "@/components/tool/FormControls";
import { VoiceInputRow } from "@/components/tool/VoiceInputRow";
import { appendTranscript } from "@/features/chatbot/lib/voice-text";
import { GUESS_MAX_LENGTH } from "../options";
import { guessesLeft } from "../lib/session-model";
import type { GuessGameSession } from "../types";
import type { GamePending } from "../hooks/useGuessGame";

interface GuessComposerProps {
  session: GuessGameSession;
  pending: GamePending;
  error: string | null;
  onGuess: (text: string) => void;
  onHint: () => void;
  onCoach: () => void;
}

export function GuessComposer({ session, pending, error, onGuess, onHint, onCoach }: GuessComposerProps) {
  const colors = useThemeColors();
  const [guessText, setGuessText] = useState("");
  const busy = pending !== null;
  const trimmed = guessText.trim();
  const canSubmit = !busy && trimmed.length > 0;

  function submit() {
    if (!canSubmit) return;
    onGuess(trimmed);
    setGuessText("");
  }

  return (
    <View style={styles.wrap}>
      <ErrorText message={error} />

      <View style={styles.row}>
        <TextInput
          value={guessText}
          onChangeText={setGuessText}
          onSubmitEditing={submit}
          editable={!busy}
          maxLength={GUESS_MAX_LENGTH}
          returnKeyType="send"
          placeholder={guessesLeft(session) === 0 ? "Out of guesses — keep trying!" : "Make a guess…"}
          placeholderTextColor={colors.mutedForeground}
          accessibilityLabel="Your guess"
          style={[styles.input, { color: colors.foreground, borderColor: colors.border, backgroundColor: colors.background }]}
        />
        <Pressable
          onPress={submit}
          disabled={!canSubmit}
          accessibilityRole="button"
          accessibilityLabel="Submit guess"
          accessibilityState={{ disabled: !canSubmit, busy: pending === "guess" }}
          style={({ pressed }) => [
            styles.submit,
            { backgroundColor: canSubmit || pending === "guess" ? colors.primary : colors.muted },
            pressed && canSubmit && { opacity: 0.85 },
          ]}
        >
          {pending === "guess" ? <ActivityIndicator color={colors.primaryForeground} /> : <Text style={[styles.submitText, { color: canSubmit ? colors.primaryForeground : colors.mutedForeground }]}>Submit</Text>}
        </Pressable>
      </View>

      <VoiceInputRow disabled={busy} onTranscript={(text) => setGuessText((value) => appendTranscript(value, text))} />

      <View style={styles.row}>
        <ActionChip label="Ask for hint" icon={Sparkles} loading={pending === "hint"} disabled={busy} onPress={onHint} />
        <ActionChip label="Get coaching" icon={LifeBuoy} loading={pending === "coach"} disabled={busy} onPress={onCoach} />
      </View>
    </View>
  );
}

function ActionChip({
  label,
  icon: Icon,
  loading,
  disabled,
  onPress,
}: {
  label: string;
  icon: LucideIcon;
  loading: boolean;
  disabled: boolean;
  onPress: () => void;
}) {
  const colors = useThemeColors();
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled, busy: loading }}
      style={({ pressed }) => [
        styles.chip,
        { borderColor: colors.border, backgroundColor: colors.card },
        pressed && !disabled && { backgroundColor: colors.muted },
        disabled && !loading && styles.disabled,
      ]}
    >
      {loading ? <ActivityIndicator size="small" color={colors.foreground} /> : <Icon size={16} color={colors.foreground} />}
      <Text numberOfLines={1} style={[styles.chipText, { color: colors.foreground }]}>
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  wrap: {
    gap: spacing.sm,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  input: {
    flex: 1,
    minHeight: 48,
    borderWidth: 1,
    borderRadius: radius.lg,
    paddingHorizontal: spacing.lg,
    fontSize: 16,
  },
  submit: {
    minHeight: 48,
    minWidth: 88,
    borderRadius: radius.lg,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: spacing.lg,
  },
  submitText: {
    fontSize: 15,
    fontWeight: "600",
  },
  chip: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.xs,
    minHeight: 40,
    borderWidth: 1,
    borderRadius: radius.full,
    paddingHorizontal: spacing.md,
  },
  chipText: {
    fontSize: 14,
    fontWeight: "600",
    flexShrink: 1,
  },
  disabled: {
    opacity: 0.5,
  },
});

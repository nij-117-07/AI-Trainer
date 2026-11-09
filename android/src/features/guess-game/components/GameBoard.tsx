// src/features/guess-game/components/GameBoard.tsx
/** The running game: badges, the solved banner, the hint and guess transcript, and the guess controls. */
import { useState } from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import { LifeBuoy, Send, Sparkles, Trophy } from "lucide-react-native";
import { radius, spacing, useThemeColors } from "@/theme";
import { ActionButton, ErrorText, Panel, TextField } from "@/components/tool/FormControls";
import { ListenButton } from "@/components/tool/ListenButton";
import { MarkdownText } from "@/components/tool/MarkdownText";
import { ResultCallout } from "@/components/tool/ResultCallout";
import { GUESS_MAX_LENGTH } from "../options";
import { guessesLeft } from "../lib/session-model";
import type { GameMessage, GuessGameSession } from "../types";
import type { GamePending } from "../hooks/useGuessGame";

interface GameBoardProps {
  session: GuessGameSession;
  pending: GamePending;
  error: string | null;
  onGuess: (text: string) => void;
  onHint: () => void;
  onCoach: () => void;
}

function capitalize(value: string): string {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

export function GameBoard({ session, pending, error, onGuess, onHint, onCoach }: GameBoardProps) {
  const colors = useThemeColors();
  const [guessText, setGuessText] = useState("");
  const busy = pending !== null;
  const trimmed = guessText.trim();

  function submit() {
    if (busy || !trimmed) return;
    onGuess(trimmed);
    setGuessText("");
  }

  return (
    <Panel>
      <View style={styles.header}>
        <View style={styles.badges}>
          <Badge label={capitalize(session.category)} />
          <Badge label={capitalize(session.difficulty)} />
        </View>
        <Text style={[styles.counter, { color: colors.foreground }]}>
          Guesses used: {session.guesses.length} / {session.maxGuesses}
        </Text>
      </View>

      {session.solved && (
        <ResultCallout icon={Trophy} title="Solved!" tone="emerald">
          <Text style={[styles.body, { color: colors.foreground }]}>
            The answer was {session.mysteryItem}. {session.funFact}
          </Text>
        </ResultCallout>
      )}

      <View style={styles.transcript}>
        {session.log.map((message, index) => (
          <MessageBubble key={`${index}-${message.role}`} message={message} />
        ))}
        {busy && (
          <View style={styles.thinking}>
            <ActivityIndicator color={colors.primary} />
            <Text style={[styles.thinkingText, { color: colors.mutedForeground }]}>Thinking…</Text>
          </View>
        )}
      </View>

      {!session.solved && (
        <>
          <TextField
            label="Your guess"
            placeholder={guessesLeft(session) === 0 ? "Out of guesses — keep trying!" : "Make a guess…"}
            value={guessText}
            onChangeText={setGuessText}
            onSubmitEditing={submit}
            editable={!busy}
            maxLength={GUESS_MAX_LENGTH}
            returnKeyType="send"
            voice
          />
          <ActionButton label="Submit guess" icon={Send} loading={pending === "guess"} onPress={submit} />
          <ActionButton
            label="Ask for a hint"
            icon={Sparkles}
            variant="outline"
            loading={pending === "hint"}
            onPress={() => {
              if (!busy) onHint();
            }}
          />
          <ActionButton
            label="Get coaching"
            icon={LifeBuoy}
            variant="outline"
            loading={pending === "coach"}
            onPress={() => {
              if (!busy) onCoach();
            }}
          />
        </>
      )}
      <ErrorText message={error} />
    </Panel>
  );
}

function MessageBubble({ message }: { message: GameMessage }) {
  const colors = useThemeColors();
  if (message.role === "user") {
    return (
      <View style={[styles.bubble, styles.userBubble, { backgroundColor: colors.primary }]}>
        <Text style={[styles.body, { color: colors.primaryForeground }]}>{message.content}</Text>
      </View>
    );
  }
  return (
    <View style={[styles.bubble, { backgroundColor: colors.muted }]}>
      <MarkdownText content={message.content} />
      <ListenButton text={message.content} label="Reply" />
    </View>
  );
}

function Badge({ label }: { label: string }) {
  const colors = useThemeColors();
  return (
    <View style={[styles.badge, { borderColor: colors.border }]}>
      <Text style={[styles.badgeText, { color: colors.foreground }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing.sm,
  },
  badges: {
    flexDirection: "row",
    gap: spacing.sm,
  },
  badge: {
    borderWidth: 1,
    borderRadius: radius.full,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
  },
  badgeText: {
    fontSize: 13,
    fontWeight: "500",
  },
  counter: {
    fontSize: 14,
    fontWeight: "600",
  },
  body: {
    fontSize: 15,
    lineHeight: 22,
  },
  transcript: {
    gap: spacing.md,
  },
  bubble: {
    borderRadius: radius.xl,
    padding: spacing.md,
  },
  userBubble: {
    alignSelf: "flex-end",
    maxWidth: "85%",
  },
  thinking: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  thinkingText: {
    fontSize: 14,
  },
});

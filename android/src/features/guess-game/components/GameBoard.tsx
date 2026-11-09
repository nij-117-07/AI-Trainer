// src/features/guess-game/components/GameBoard.tsx
/**
 * The running game: badges, the solved banner, and the hint and guess transcript. The transcript
 * scrolls inside its own box. Guess input and actions live in the screen footer (see GuessComposer).
 */
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import { Trophy } from "lucide-react-native";
import { radius, spacing, useThemeColors } from "@/theme";
import { Panel } from "@/components/tool/FormControls";
import { ListenButton } from "@/components/tool/ListenButton";
import { MarkdownText } from "@/components/tool/MarkdownText";
import { ResultCallout } from "@/components/tool/ResultCallout";
import { ScrollPanel } from "@/components/tool/ScrollPanel";
import type { GameMessage, GuessGameSession } from "../types";
import type { GamePending } from "../hooks/useGuessGame";

interface GameBoardProps {
  session: GuessGameSession;
  pending: GamePending;
}

function capitalize(value: string): string {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

export function GameBoard({ session, pending }: GameBoardProps) {
  const colors = useThemeColors();

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

      <ScrollPanel scrollKey={`${session.log.length}-${pending ?? ""}`}>
        {session.log.map((message, index) => (
          <MessageBubble key={`${index}-${message.role}`} message={message} />
        ))}
        {pending !== null && (
          <View style={styles.thinking}>
            <ActivityIndicator color={colors.primary} />
            <Text style={[styles.thinkingText, { color: colors.mutedForeground }]}>Thinking…</Text>
          </View>
        )}
      </ScrollPanel>
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

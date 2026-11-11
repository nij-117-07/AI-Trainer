// src/features/guess-game/components/GuessGameRoundView.tsx
/**
 * The running game in the page body: the level and guesses left, the solved banner, the hints,
 * every guess with its verdict, and the latest feedback and coaching. The guess box is in the
 * screen footer, and "New game" is in the top bar (see the route).
 */
import { useEffect } from "react";
import { StyleSheet, Text, View } from "react-native";
import { CircleCheck, CircleX, Compass, Lightbulb, LifeBuoy, ListChecks, Trophy } from "lucide-react-native";
import { shape, spacing, typeScale, useThemeColors } from "@/theme";
import { ActionButton, Panel } from "@/components/tool/FormControls";
import { ListenButton } from "@/components/tool/ListenButton";
import { MarkdownText } from "@/components/tool/MarkdownText";
import { ResultCallout } from "@/components/tool/ResultCallout";
import { SectionTitle } from "@/components/tool/SectionTitle";
import { useToolScroll } from "@/components/tool/ToolScrollContext";
import type { GuessGameRoundState } from "../hooks/useGuessGameRound";
import { guessesLeft } from "../lib/session-model";
import type { GuessGameSession } from "../types";

interface GuessGameRoundViewProps {
  session: GuessGameSession;
  game: GuessGameRoundState;
}

function capitalize(value: string): string {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

export function GuessGameRoundView({ session, game }: GuessGameRoundViewProps) {
  const colors = useThemeColors();
  const scroll = useToolScroll();
  const busy = game.pending !== null;
  const latest = session.attempts.length > 0 ? session.attempts[session.attempts.length - 1] : null;

  useEffect(() => {
    scroll?.current?.scrollToEnd({ animated: true });
  }, [session.attempts.length, session.hints.length, session.coaching, scroll]);

  return (
    <>
      <Panel>
        <View style={styles.meta}>
          <Badge label={capitalize(session.category)} />
          <Badge label={capitalize(session.difficulty)} />
          <Text
            accessibilityLiveRegion="polite"
            style={[styles.counter, { color: colors.foreground }]}
          >
            Guesses left: {guessesLeft(session)} / {session.maxGuesses}
          </Text>
        </View>
        {session.solved && (
          <ResultCallout icon={Trophy} title="Solved!" tone="emerald">
            <Text accessibilityLiveRegion="polite" style={[styles.body, { color: colors.foreground }]}>
              The answer was {session.mysteryItem}. {session.funFact}
            </Text>
          </ResultCallout>
        )}
      </Panel>

      <Panel>
        <SectionTitle icon={Lightbulb} title="Hints" />
        {session.hints.map((item, index) => (
          <View
            key={`${index}-${item.hint}`}
            style={[styles.row, { borderColor: colors.border, backgroundColor: colors.background }]}
          >
            <Text style={[styles.rowNumber, { color: colors.mutedForeground }]}>{index + 1}</Text>
            <View style={styles.flex}>
              <MarkdownText content={item.hint} />
              {item.encouragement ? (
                <Text style={[styles.caption, { color: colors.mutedForeground }]}>{item.encouragement}</Text>
              ) : null}
            </View>
          </View>
        ))}
        {!session.solved && (
          <ActionButton
            label={game.pending === "hint" ? "Finding a hint…" : "Ask for a hint"}
            icon={Lightbulb}
            variant="outline"
            loading={game.pending === "hint"}
            disabled={busy}
            onPress={() => void game.getHint()}
          />
        )}
      </Panel>

      {session.attempts.length > 0 && (
        <Panel>
          <SectionTitle icon={ListChecks} title="Your guesses" />
          {session.attempts.map((attempt, index) => {
            const correct = attempt.result.correct;
            const Icon = correct ? CircleCheck : CircleX;
            return (
              <View
                key={`${index}-${attempt.guess}`}
                accessible
                accessibilityLabel={`Guess ${index + 1}: ${attempt.guess}. ${correct ? "Correct" : "Not quite"}`}
                style={[styles.row, { borderColor: colors.border, backgroundColor: colors.background }]}
              >
                <Text style={[styles.rowNumber, { color: colors.mutedForeground }]}>{index + 1}</Text>
                <Icon size={16} color={correct ? colors.foreground : colors.destructive} />
                <Text style={[styles.rowText, { color: colors.foreground }]} numberOfLines={2}>
                  {attempt.guess}
                </Text>
                <Text style={[styles.caption, { color: colors.mutedForeground }]}>
                  {correct ? "Correct" : "Not quite"}
                </Text>
              </View>
            );
          })}
        </Panel>
      )}

      {latest && !session.solved && (
        <Panel>
          <ResultCallout icon={CircleX} title="Not quite" tone="rose">
            <MarkdownText content={latest.result.feedback} />
            <ListenButton text={latest.result.feedback} label="Feedback" />
          </ResultCallout>
          {latest.result.suggestion ? (
            <ResultCallout icon={Compass} title="Nudge" tone="amber">
              <Text style={[styles.body, { color: colors.foreground }]}>{latest.result.suggestion}</Text>
              <ListenButton text={latest.result.suggestion} label="Nudge" />
            </ResultCallout>
          ) : null}
        </Panel>
      )}

      {!session.solved && (
        <Panel>
          {session.coaching ? (
            <>
              <ResultCallout icon={LifeBuoy} title="Coach" tone="rose">
                <MarkdownText content={session.coaching.coaching} />
                <ListenButton text={session.coaching.coaching} label="Coach" />
              </ResultCallout>
              <ResultCallout icon={Compass} title="Thinking framework" tone="sky">
                <MarkdownText content={session.coaching.framework} />
                {session.coaching.partialReveal ? (
                  <Text style={[styles.body, { color: colors.foreground }]}>
                    Partial reveal: {session.coaching.partialReveal}
                  </Text>
                ) : null}
              </ResultCallout>
            </>
          ) : null}
          <ActionButton
            label={game.pending === "coach" ? "Thinking it through…" : "Get coaching"}
            icon={LifeBuoy}
            variant="outline"
            loading={game.pending === "coach"}
            disabled={busy}
            onPress={() => void game.getCoaching()}
          />
        </Panel>
      )}
    </>
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
  flex: {
    flex: 1,
  },
  meta: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
    gap: spacing.sm,
  },
  badge: {
    borderWidth: 1,
    borderRadius: shape.full,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
  },
  badgeText: {
    ...typeScale.caption,
  },
  counter: {
    ...typeScale.label,
    fontWeight: "600",
  },
  body: {
    ...typeScale.body,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    borderWidth: 1,
    borderRadius: shape.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
  },
  rowNumber: {
    ...typeScale.caption,
    fontWeight: "700",
    minWidth: 14,
  },
  rowText: {
    ...typeScale.body,
    flex: 1,
  },
  caption: {
    ...typeScale.caption,
  },
});

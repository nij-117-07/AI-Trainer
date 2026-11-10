// src/features/debate/components/DebateBoard.tsx
/**
 * The debate on the practice page. The body holds the status and "End & judge", the verdict once
 * judged, the personas dropdown, the transcript (a box with its own scroll), and the breakdown of
 * the last AI turn. The turn form is the page footer (DebateTurnFooter).
 */
import { useEffect, useRef } from "react";
import { Alert, ScrollView, StyleSheet, Text, View, type ScrollViewInstance } from "react-native";
import { Crosshair, Gavel, MessageSquare, MessageSquareQuote, Swords } from "lucide-react-native";
import { useRouter } from "expo-router";
import { radius, spacing, useThemeColors } from "@/theme";
import { ActionButton, Panel } from "@/components/tool/FormControls";
import { Disclosure } from "@/components/tool/Disclosure";
import { ListenButton } from "@/components/tool/ListenButton";
import { MarkdownText } from "@/components/tool/MarkdownText";
import { ResultCallout } from "@/components/tool/ResultCallout";
import { SectionTitle } from "@/components/tool/SectionTitle";
import { TagList } from "@/components/tool/TagList";
import { parseLogEntry } from "../lib/session";
import { textList } from "../lib/text";
import type { DebateSession, DebateTurn } from "../types";
import type { DebateSessionState } from "../hooks/useDebateSession";
import { DebatePersonas } from "./DebatePersonas";
import { DebateVerdictCard } from "./DebateVerdictCard";

const TRANSCRIPT_MAX_HEIGHT = 320;

export function DebateBoard({ game, session }: { game: DebateSessionState; session: DebateSession }) {
  const colors = useThemeColors();
  const router = useRouter();
  const active = !session.complete;
  const { busy } = game;
  const statements = session.history.length;

  function confirmJudge() {
    Alert.alert(
      "End and judge?",
      "The judge scores the statements so far. You can't add more statements after the verdict.",
      [
        { text: "Cancel", style: "cancel" },
        { text: "End & judge", onPress: () => void game.endAndJudge() },
      ],
    );
  }

  return (
    <>
      <Panel>
        <View style={styles.stack}>
          <View style={styles.headerRow}>
            <View style={[styles.pill, { borderColor: colors.border }]}>
              <Text style={[styles.pillText, { color: colors.foreground }]}>{active ? "Debating" : "Judged"}</Text>
            </View>
            <Text style={[styles.count, { color: colors.mutedForeground }]}>
              {statements} {statements === 1 ? "statement" : "statements"}
            </Text>
          </View>
          <Text style={[styles.topic, { color: colors.foreground }]}>{session.topic}</Text>
          {active && (
            <ActionButton
              label={game.judging ? "Judging…" : "End & judge"}
              icon={Gavel}
              variant="outline"
              loading={game.judging}
              disabled={busy || statements === 0}
              onPress={confirmJudge}
            />
          )}
        </View>
      </Panel>

      {session.verdict && <DebateVerdictCard verdict={session.verdict} />}

      <DebatePersonas game={game} session={session} />

      <Transcript log={textList(session.log)} />

      {session.lastTurn && active && <AiTurnBreakdown turn={session.lastTurn} />}

      {active && (
        <ActionButton
          label="Start a different debate"
          icon={Swords}
          variant="outline"
          disabled={busy}
          onPress={() => router.push("/practice/debate/new")}
        />
      )}
    </>
  );
}

function Transcript({ log }: { log: string[] }) {
  const colors = useThemeColors();
  const scroll = useRef<ScrollViewInstance>(null);

  useEffect(() => {
    scroll.current?.scrollToEnd({ animated: true });
  }, [log.length]);

  return (
    <Panel>
      <SectionTitle icon={MessageSquare} title="Transcript" />
      <ScrollView ref={scroll} style={{ maxHeight: TRANSCRIPT_MAX_HEIGHT }} nestedScrollEnabled>
        <View style={styles.transcript}>
          {log.map((raw, index) => {
            const entry = parseLogEntry(raw);
            if (!entry.side) {
              return (
                <View key={index} style={[styles.entry, { borderColor: colors.border }]}>
                  <MarkdownText content={entry.text} />
                </View>
              );
            }
            return (
              <View key={index} style={[styles.entry, { borderColor: colors.border }]}>
                <View style={styles.speaker}>
                  <View style={[styles.badge, { borderColor: colors.border }]}>
                    <Text style={[styles.badgeText, { color: colors.foreground }]}>
                      {entry.side === "pro" ? "Pro" : "Con"}
                    </Text>
                  </View>
                  <Text numberOfLines={1} style={[styles.speakerName, { color: colors.mutedForeground }]}>
                    {entry.speaker}
                  </Text>
                </View>
                <MarkdownText content={entry.text} />
              </View>
            );
          })}
        </View>
      </ScrollView>
    </Panel>
  );
}

function AiTurnBreakdown({ turn }: { turn: DebateTurn }) {
  const colors = useThemeColors();
  return (
    <Disclosure title="Last AI turn" icon={Crosshair} summary={turn.coreClaim}>
      <Detail title="Opponent analysis" text={turn.opponentAnalysis} />
      <Detail title="Reasoning & evidence" text={turn.reasoningAndEvidence} />
      <TagList items={textList(turn.rhetoricalDevices)} />
      <ResultCallout icon={MessageSquareQuote} title="Closing question" tone="sky">
        <Text style={[styles.body, { color: colors.foreground }]}>{turn.closingQuestion}</Text>
        <ListenButton text={turn.closingQuestion} label="Closing question" />
      </ResultCallout>
    </Disclosure>
  );
}

function Detail({ title, text }: { title: string; text: string }) {
  const colors = useThemeColors();
  return (
    <View style={styles.detail}>
      <Text style={[styles.label, { color: colors.mutedForeground }]}>{title}</Text>
      <Text style={[styles.body, { color: colors.foreground }]}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  stack: {
    gap: spacing.md,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  pill: {
    borderWidth: 1,
    borderRadius: radius.full,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
  },
  pillText: {
    fontSize: 13,
    fontWeight: "600",
  },
  count: {
    fontSize: 13,
  },
  topic: {
    fontSize: 15,
    fontWeight: "600",
  },
  transcript: {
    gap: spacing.md,
  },
  entry: {
    borderTopWidth: 1,
    paddingTop: spacing.md,
    gap: spacing.sm,
  },
  speaker: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  badge: {
    borderWidth: 1,
    borderRadius: radius.full,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: "600",
  },
  speakerName: {
    flexShrink: 1,
    fontSize: 13,
  },
  detail: {
    gap: spacing.xs,
  },
  label: {
    fontSize: 13,
    fontWeight: "600",
  },
  body: {
    fontSize: 15,
    lineHeight: 22,
  },
});

// src/features/debate/components/DebateBoard.tsx
/**
 * The debate chat. The transcript fills the space between the header and the footer, with Pro on
 * the left and Con on the right. A verdict, once judged, sits above it. The topic is in the header,
 * the personas and the last AI turn are in the sidebar, and the turn form is the footer.
 */
import { useEffect, useRef } from "react";
import { ScrollView, StyleSheet, Text, View, type ScrollViewInstance } from "react-native";
import { MessageSquare } from "lucide-react-native";
import { shape, spacing, typeScale, useThemeColors } from "@/theme";
import { Panel } from "@/components/tool/FormControls";
import { ListenButton } from "@/components/tool/ListenButton";
import { MarkdownText } from "@/components/tool/MarkdownText";
import { SectionTitle } from "@/components/tool/SectionTitle";
import { parseLogEntry, type LogEntry } from "../lib/session";
import { textList } from "../lib/text";
import type { DebateSession } from "../types";
import type { DebateSessionState } from "../hooks/useDebateSession";
import { DebateVerdictCard } from "./DebateVerdictCard";

const VERDICT_MAX_HEIGHT = 280;

export function DebateBoard({ game, session }: { game: DebateSessionState; session: DebateSession }) {
  const status = game.judging ? "Judging the debate…" : game.busy ? "AI is working…" : null;

  return (
    <View style={styles.board}>
      {session.verdict && (
        <ScrollView style={{ maxHeight: VERDICT_MAX_HEIGHT }} nestedScrollEnabled>
          <DebateVerdictCard verdict={session.verdict} />
        </ScrollView>
      )}
      <Transcript log={textList(session.log)} status={status} />
    </View>
  );
}

function Transcript({ log, status }: { log: string[]; status: string | null }) {
  const colors = useThemeColors();
  const scroll = useRef<ScrollViewInstance>(null);
  const entries = log.map(parseLogEntry).filter((entry) => entry.side !== null);

  useEffect(() => {
    scroll.current?.scrollToEnd({ animated: true });
  }, [log.length]);

  return (
    <Panel style={styles.chat}>
      <View style={styles.chatHeader}>
        <SectionTitle icon={MessageSquare} title="Transcript" />
        {status ? (
          <Text accessibilityLiveRegion="polite" style={[styles.status, { color: colors.mutedForeground }]}>
            {status}
          </Text>
        ) : null}
      </View>
      {entries.length === 0 ? (
        <Text style={[styles.body, { color: colors.mutedForeground }]}>No statements yet.</Text>
      ) : (
        <ScrollView ref={scroll} style={styles.chatScroll} nestedScrollEnabled>
          <View style={styles.transcript}>
            {entries.map((entry, index) => (
              <Statement key={index} entry={entry} />
            ))}
          </View>
        </ScrollView>
      )}
    </Panel>
  );
}

function Statement({ entry }: { entry: LogEntry }) {
  const colors = useThemeColors();
  const pro = entry.side === "pro";

  return (
    <View style={[styles.statement, pro ? styles.alignStart : styles.alignEnd]}>
      <View style={[styles.speaker, { flexDirection: pro ? "row" : "row-reverse" }]}>
        <View style={[styles.badge, { borderColor: colors.border }]}>
          <Text style={[styles.badgeText, { color: colors.foreground }]}>{pro ? "Pro" : "Con"}</Text>
        </View>
        <Text numberOfLines={1} style={[styles.speakerName, { color: colors.mutedForeground }]}>
          {entry.speaker}
        </Text>
      </View>
      <View style={[styles.bubble, { backgroundColor: pro ? colors.muted : colors.card, borderColor: colors.border }]}>
        <MarkdownText content={entry.text} />
        <View style={styles.listen}>
          <ListenButton text={entry.text} label={`${pro ? "Pro" : "Con"} statement`} />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  board: {
    flex: 1,
    minHeight: 0,
    gap: spacing.md,
  },
  chat: {
    flex: 1,
    minHeight: 0,
    gap: spacing.md,
  },
  chatHeader: {
    gap: spacing.xs,
  },
  chatScroll: {
    flex: 1,
  },
  status: {
    ...typeScale.label,
  },
  transcript: {
    gap: spacing.md,
  },
  statement: {
    maxWidth: "88%",
    gap: spacing.xs,
  },
  alignStart: {
    alignSelf: "flex-start",
  },
  alignEnd: {
    alignSelf: "flex-end",
  },
  speaker: {
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
    ...typeScale.label,
    fontWeight: "600",
  },
  speakerName: {
    flexShrink: 1,
    ...typeScale.label,
  },
  bubble: {
    borderWidth: 1,
    borderRadius: shape.lg,
    padding: spacing.md,
    gap: spacing.xs,
  },
  listen: {
    alignSelf: "flex-end",
  },
  body: {
    ...typeScale.body,
  },
});

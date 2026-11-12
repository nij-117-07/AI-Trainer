// src/features/debate/components/DebateSidebar.tsx
/**
 * The debate sidebar: the two personas, then the breakdown of the last AI turn. On tablet and
 * desktop it sits in the side panel; on a phone it opens as a sheet from the header.
 */
import { StyleSheet, Text, View } from "react-native";
import { Crosshair, MessageSquareQuote } from "lucide-react-native";
import { spacing, typeScale, useThemeColors } from "@/theme";
import { Disclosure } from "@/components/tool/Disclosure";
import { ListenButton } from "@/components/tool/ListenButton";
import { ResultCallout } from "@/components/tool/ResultCallout";
import { TagList } from "@/components/tool/TagList";
import { textList } from "../lib/text";
import type { DebateSession, DebateTurn } from "../types";
import type { DebateSessionState } from "../hooks/useDebateSession";
import { DebatePersonas } from "./DebatePersonas";

export function DebateSidebar({ game, session }: { game: DebateSessionState; session: DebateSession }) {
  return (
    <>
      <DebatePersonas game={game} session={session} />
      {session.lastTurn && !session.complete && <AiTurnBreakdown turn={session.lastTurn} />}
    </>
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
  detail: {
    gap: spacing.xs,
  },
  label: {
    ...typeScale.label,
    fontWeight: "600",
  },
  body: {
    ...typeScale.body,
  },
});

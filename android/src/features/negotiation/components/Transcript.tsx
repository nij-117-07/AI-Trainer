// src/features/negotiation/components/Transcript.tsx
/** Chat transcript for a negotiation: opponent and trainee messages, with coach tips between them. */
import { StyleSheet, Text, View } from "react-native";
import { Lightbulb } from "lucide-react-native";
import { radius, spacing, useThemeColors } from "@/theme";
import { MarkdownText } from "@/components/tool/MarkdownText";
import { ResultCallout } from "@/components/tool/ResultCallout";
import type { SessionEntry } from "../types";

export function Transcript({ entries }: { entries: SessionEntry[] }) {
  return (
    <View style={styles.list}>
      {entries.map((entry, index) => (
        <Entry key={index} entry={entry} />
      ))}
    </View>
  );
}

function Entry({ entry }: { entry: SessionEntry }) {
  const colors = useThemeColors();

  if (entry.role === "coach") {
    return (
      <ResultCallout icon={Lightbulb} title="Coach tip" tone="emerald">
        <MarkdownText content={entry.text} />
      </ResultCallout>
    );
  }

  const isUser = entry.role === "user";
  return (
    <View
      style={[
        styles.bubble,
        isUser ? styles.userBubble : styles.opponentBubble,
        { backgroundColor: isUser ? colors.tone.sky.bg : colors.muted, borderColor: colors.border },
      ]}
    >
      <Text style={[styles.speaker, { color: colors.mutedForeground }]}>{isUser ? "You" : "Opponent"}</Text>
      <MarkdownText content={entry.text} />
    </View>
  );
}

const styles = StyleSheet.create({
  list: {
    gap: spacing.md,
  },
  bubble: {
    maxWidth: "90%",
    borderWidth: 1,
    borderRadius: radius.xl,
    padding: spacing.md,
    gap: spacing.xs,
  },
  userBubble: {
    alignSelf: "flex-end",
  },
  opponentBubble: {
    alignSelf: "flex-start",
  },
  speaker: {
    fontSize: 12,
    fontWeight: "600",
  },
});

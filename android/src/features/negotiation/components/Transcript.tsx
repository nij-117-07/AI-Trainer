// src/features/negotiation/components/Transcript.tsx
/**
 * Chat transcript for a negotiation: the trainee's messages on the right, the opponent's replies
 * full width without a bubble, and coach tips between them.
 */
import { StyleSheet, Text, View } from "react-native";
import { Lightbulb } from "lucide-react-native";
import { shape, spacing, typeScale, useThemeColors } from "@/theme";
import { ListenButton } from "@/components/tool/ListenButton";
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
        <ListenButton text={entry.text} label="coach tip" />
      </ResultCallout>
    );
  }

  if (entry.role === "user") {
    return (
      <View style={[styles.userMessage, { backgroundColor: colors.tone.sky.bg }]}>
        <MarkdownText content={entry.text} />
      </View>
    );
  }

  return (
    <View style={styles.opponent}>
      <Text accessibilityRole="text" style={[styles.speaker, { color: colors.mutedForeground }]}>
        Opponent
      </Text>
      <MarkdownText content={entry.text} />
      <ListenButton text={entry.text} label="opponent's reply" />
    </View>
  );
}

const styles = StyleSheet.create({
  list: {
    gap: spacing.md,
  },
  userMessage: {
    alignSelf: "flex-end",
    maxWidth: "80%",
    borderRadius: shape.lg,
    borderTopRightRadius: shape.xs,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
  },
  opponent: {
    gap: spacing.xs,
  },
  speaker: {
    ...typeScale.body,
    fontWeight: "600",
  },
});

// src/features/topic-suggestions/components/TopicRow.tsx
/** One topic on the list: tick it, open it to read why it fits, or remove it. */
import { useState } from "react";
import { Alert, Pressable, StyleSheet, Text, View } from "react-native";
import { Check, ChevronDown, ChevronUp, Trash2 } from "lucide-react-native";
import { radius, spacing, useThemeColors } from "@/theme";
import { ListenButton } from "@/components/tool/ListenButton";
import { MarkdownText } from "@/components/tool/MarkdownText";
import type { TopicRecommendation } from "@/features/guides/types";
import type { SavedTopic } from "../types";

export function TopicDetails({ topic }: { topic: TopicRecommendation }) {
  const colors = useThemeColors();
  if (topic.reason.trim() === "") return null;
  return (
    <View style={styles.details}>
      <Text style={[styles.detailsLabel, { color: colors.mutedForeground }]}>Why this topic</Text>
      <MarkdownText content={topic.reason} />
      <ListenButton text={topic.reason} label="Reason" />
    </View>
  );
}

interface TopicRowProps {
  topic: SavedTopic;
  onToggle: () => void;
  onRemove: () => void;
}

export function TopicRow({ topic, onToggle, onRemove }: TopicRowProps) {
  const colors = useThemeColors();
  const [open, setOpen] = useState(false);

  function confirmRemove() {
    Alert.alert("Remove this topic?", `"${topic.topicName}" will be removed from your list.`, [
      { text: "Cancel", style: "cancel" },
      { text: "Remove", style: "destructive", onPress: onRemove },
    ]);
  }

  return (
    <View style={[styles.row, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <View style={styles.head}>
        <Pressable
          onPress={onToggle}
          accessibilityRole="checkbox"
          accessibilityLabel={`Mark "${topic.topicName}" done`}
          accessibilityState={{ checked: topic.done }}
          hitSlop={10}
          style={[
            styles.checkbox,
            {
              borderColor: topic.done ? colors.primary : colors.border,
              backgroundColor: topic.done ? colors.primary : colors.background,
            },
          ]}
        >
          {topic.done ? <Check size={14} color={colors.primaryForeground} /> : null}
        </Pressable>

        <Pressable
          onPress={() => setOpen((value) => !value)}
          accessibilityRole="button"
          accessibilityState={{ expanded: open }}
          accessibilityLabel={`${open ? "Collapse" : "Expand"} ${topic.topicName}`}
          style={styles.titleArea}
        >
          <Text
            numberOfLines={open ? undefined : 2}
            style={[
              styles.title,
              { color: topic.done ? colors.mutedForeground : colors.foreground },
              topic.done && styles.done,
            ]}
          >
            {topic.topicName}
          </Text>
          {open ? (
            <ChevronUp size={18} color={colors.mutedForeground} />
          ) : (
            <ChevronDown size={18} color={colors.mutedForeground} />
          )}
        </Pressable>

        <Pressable
          onPress={confirmRemove}
          accessibilityRole="button"
          accessibilityLabel={`Remove ${topic.topicName}`}
          style={styles.remove}
        >
          <Trash2 size={18} color={colors.mutedForeground} />
        </Pressable>
      </View>

      {open ? (
        <View style={[styles.body, { borderTopColor: colors.border }]}>
          <TopicDetails topic={topic} />
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    borderWidth: 1,
    borderRadius: radius.xl,
    overflow: "hidden",
  },
  head: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderWidth: 1,
    borderRadius: radius.md,
    alignItems: "center",
    justifyContent: "center",
  },
  titleArea: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    minHeight: 40,
  },
  title: {
    flex: 1,
    fontSize: 15,
    fontWeight: "600",
  },
  done: {
    textDecorationLine: "line-through",
  },
  remove: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  body: {
    borderTopWidth: 1,
    padding: spacing.lg,
  },
  details: {
    gap: spacing.md,
  },
  detailsLabel: {
    fontSize: 13,
    fontWeight: "600",
  },
});

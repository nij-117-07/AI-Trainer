// src/features/topic-suggestions/components/TopicCandidateRow.tsx
/** One suggested topic with a checkbox. Tap the title to read why it fits before choosing. */
import { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { Check, ChevronDown, ChevronUp } from "lucide-react-native";
import { radius, spacing, useThemeColors } from "@/theme";
import type { TopicRecommendation } from "@/features/guides/types";
import { TopicDetails } from "./TopicRow";

interface TopicCandidateRowProps {
  topic: TopicRecommendation;
  selected: boolean;
  onToggle: () => void;
}

export function TopicCandidateRow({ topic, selected, onToggle }: TopicCandidateRowProps) {
  const colors = useThemeColors();
  const [open, setOpen] = useState(false);

  return (
    <View style={[styles.row, { backgroundColor: colors.card, borderColor: selected ? colors.primary : colors.border }]}>
      <View style={styles.head}>
        <Pressable
          onPress={onToggle}
          accessibilityRole="checkbox"
          accessibilityLabel={`Add "${topic.topicName}" to my list`}
          accessibilityState={{ checked: selected }}
          hitSlop={10}
          style={[
            styles.checkbox,
            {
              borderColor: selected ? colors.primary : colors.border,
              backgroundColor: selected ? colors.primary : colors.background,
            },
          ]}
        >
          {selected ? <Check size={14} color={colors.primaryForeground} /> : null}
        </Pressable>

        <Pressable
          onPress={() => setOpen((value) => !value)}
          accessibilityRole="button"
          accessibilityState={{ expanded: open }}
          accessibilityLabel={`${open ? "Collapse" : "Expand"} ${topic.topicName}`}
          style={styles.titleArea}
        >
          <Text numberOfLines={open ? undefined : 2} style={[styles.title, { color: colors.foreground }]}>
            {topic.topicName}
          </Text>
          {open ? (
            <ChevronUp size={18} color={colors.mutedForeground} />
          ) : (
            <ChevronDown size={18} color={colors.mutedForeground} />
          )}
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
    minHeight: 44,
  },
  title: {
    flex: 1,
    fontSize: 15,
    fontWeight: "600",
  },
  body: {
    borderTopWidth: 1,
    padding: spacing.lg,
  },
});

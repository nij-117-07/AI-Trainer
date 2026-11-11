// src/features/topic-suggestions/components/TopicCandidateRow.tsx
/** One suggested topic as a checklist row. The whole row toggles, and the reason sits on one line under the title. */
import { Pressable, StyleSheet, Text, View } from "react-native";
import { Check } from "lucide-react-native";
import { shape, spacing, typeScale, useThemeColors } from "@/theme";
import type { TopicRecommendation } from "@/features/guides/types";

interface TopicCandidateRowProps {
  topic: TopicRecommendation;
  selected: boolean;
  onToggle: () => void;
}

export function TopicCandidateRow({ topic, selected, onToggle }: TopicCandidateRowProps) {
  const colors = useThemeColors();

  return (
    <Pressable
      onPress={onToggle}
      accessibilityRole="checkbox"
      accessibilityLabel={`Keep topic ${topic.topicName}`}
      accessibilityState={{ checked: selected }}
      style={({ pressed }) => [
        styles.row,
        { backgroundColor: colors.card, borderColor: selected ? colors.primary : colors.border },
        pressed && { backgroundColor: colors.muted },
      ]}
    >
      <View
        style={[
          styles.box,
          {
            borderColor: selected ? colors.primary : colors.border,
            backgroundColor: selected ? colors.primary : colors.background,
          },
        ]}
      >
        {selected ? <Check size={14} color={colors.primaryForeground} /> : null}
      </View>

      <View style={styles.text}>
        <Text numberOfLines={2} style={[styles.title, { color: colors.foreground }]}>
          {topic.topicName}
        </Text>
        {topic.reason.trim() !== "" ? (
          <Text numberOfLines={1} style={[styles.reason, { color: colors.mutedForeground }]}>
            {topic.reason}
          </Text>
        ) : null}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    minHeight: 56,
    borderWidth: 1,
    borderRadius: shape.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  box: {
    width: 22,
    height: 22,
    borderWidth: 1,
    borderRadius: shape.xs,
    alignItems: "center",
    justifyContent: "center",
  },
  text: {
    flex: 1,
    gap: spacing.xs,
  },
  title: {
    ...typeScale.body,
    fontWeight: "600",
  },
  reason: {
    ...typeScale.caption,
  },
});

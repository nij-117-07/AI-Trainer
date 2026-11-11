// src/features/topic-suggestions/components/TopicRow.tsx
/** One saved topic on the list, one line high. Tap the row to mark it done, or tap the trash icon to remove it. */
import { Alert, Pressable, StyleSheet, Text, View } from "react-native";
import { Check, Trash2 } from "lucide-react-native";
import { shape, spacing, touchTarget, typeScale, useThemeColors } from "@/theme";
import type { SavedTopic } from "../types";

interface TopicRowProps {
  topic: SavedTopic;
  onToggle: () => void;
  onRemove: () => void;
}

export function TopicRow({ topic, onToggle, onRemove }: TopicRowProps) {
  const colors = useThemeColors();

  function confirmRemove() {
    Alert.alert("Remove this topic?", `"${topic.topicName}" will be removed from your list.`, [
      { text: "Cancel", style: "cancel" },
      { text: "Remove", style: "destructive", onPress: onRemove },
    ]);
  }

  return (
    <View style={[styles.row, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <Pressable
        onPress={onToggle}
        accessibilityRole="checkbox"
        accessibilityLabel={`Mark topic ${topic.topicName} done`}
        accessibilityState={{ checked: topic.done }}
        style={({ pressed }) => [styles.toggle, pressed && { backgroundColor: colors.muted }]}
      >
        <View
          style={[
            styles.box,
            {
              borderColor: topic.done ? colors.primary : colors.border,
              backgroundColor: topic.done ? colors.primary : colors.background,
            },
          ]}
        >
          {topic.done ? <Check size={14} color={colors.primaryForeground} /> : null}
        </View>
        <Text
          numberOfLines={1}
          style={[
            styles.title,
            { color: topic.done ? colors.mutedForeground : colors.foreground },
            topic.done && styles.done,
          ]}
        >
          {topic.topicName}
        </Text>
      </Pressable>

      <Pressable
        onPress={confirmRemove}
        accessibilityRole="button"
        accessibilityLabel={`Remove topic ${topic.topicName}`}
        style={({ pressed }) => [styles.remove, pressed && { backgroundColor: colors.muted }]}
      >
        <Trash2 size={20} color={colors.mutedForeground} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    minHeight: 56,
    borderWidth: 1,
    borderRadius: shape.md,
    overflow: "hidden",
    paddingLeft: spacing.md,
  },
  toggle: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "stretch",
    gap: spacing.md,
    minWidth: 0,
  },
  box: {
    width: 22,
    height: 22,
    borderWidth: 1,
    borderRadius: shape.xs,
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    flex: 1,
    ...typeScale.body,
    fontWeight: "600",
  },
  done: {
    textDecorationLine: "line-through",
  },
  remove: {
    width: touchTarget,
    height: touchTarget,
    alignItems: "center",
    justifyContent: "center",
  },
});

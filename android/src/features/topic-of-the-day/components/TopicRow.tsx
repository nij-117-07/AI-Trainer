// src/features/topic-of-the-day/components/TopicRow.tsx
/** One saved topic in the list. Tapping opens it, or picks it while selecting. Selection shows a check mark, not colour alone. */
import { Pressable, StyleSheet, Text, View } from "react-native";
import { Check, ChevronRight } from "lucide-react-native";
import { shape, spacing, typeScale, useThemeColors } from "@/theme";
import { pointerCursor } from "@/components/tool/FormControls";
import type { SavedTopic } from "../types";

interface TopicRowProps {
  topic: SavedTopic;
  selecting: boolean;
  selected: boolean;
  onPress: () => void;
}

export function TopicRow({ topic, selecting, selected, onPress }: TopicRowProps) {
  const colors = useThemeColors();
  const title = topic.title || "Untitled topic";
  const meta = [topic.focus, topic.date].filter(Boolean).join(" · ");

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole={selecting ? "checkbox" : "button"}
      accessibilityLabel={selecting ? title : `Open topic ${title}`}
      accessibilityState={selecting ? { checked: selected } : undefined}
      style={({ pressed }) => [
        styles.row,
        pointerCursor,
        {
          backgroundColor: selected ? colors.muted : colors.card,
          borderColor: selected ? colors.primary : colors.border,
        },
        pressed && { opacity: 0.85 },
      ]}
    >
      {selecting ? (
        <View
          style={[
            styles.check,
            {
              borderColor: selected ? colors.primary : colors.border,
              backgroundColor: selected ? colors.primary : colors.card,
            },
          ]}
        >
          {selected ? <Check size={14} color={colors.primaryForeground} /> : null}
        </View>
      ) : null}
      <View style={styles.text}>
        <Text numberOfLines={2} style={[styles.title, { color: colors.foreground }]}>
          {title}
        </Text>
        {meta ? (
          <Text numberOfLines={1} style={[styles.meta, { color: colors.mutedForeground }]}>
            {meta}
          </Text>
        ) : null}
      </View>
      {selecting ? null : <ChevronRight size={20} color={colors.mutedForeground} />}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    minHeight: 72,
    borderWidth: 1,
    borderRadius: shape.lg,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  check: {
    width: 24,
    height: 24,
    borderRadius: shape.full,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  text: {
    flex: 1,
    gap: spacing.xs,
  },
  title: {
    ...typeScale.label,
    fontWeight: "600",
  },
  meta: {
    ...typeScale.caption,
  },
});

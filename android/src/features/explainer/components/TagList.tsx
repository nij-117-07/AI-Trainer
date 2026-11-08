// src/features/explainer/components/TagList.tsx
/** Wrapping row of small chips, used for metaphors, prerequisites, and key terms. */
import { StyleSheet, Text, View } from "react-native";
import { radius, spacing, useThemeColors } from "@/theme";

export function TagList({ items }: { items: string[] }) {
  const colors = useThemeColors();
  if (items.length === 0) return null;
  return (
    <View style={styles.row}>
      {items.map((item, index) => (
        <View key={`${item}-${index}`} style={[styles.chip, { backgroundColor: colors.muted, borderColor: colors.border }]}>
          <Text style={[styles.text, { color: colors.foreground }]}>{item}</Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
  },
  chip: {
    borderWidth: 1,
    borderRadius: radius.full,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
  },
  text: {
    fontSize: 13,
    fontWeight: "500",
  },
});

// src/features/ai-detector/components/BulletList.tsx
/** Bullet list of flagged patterns or suggested changes. The enclosing disclosure gives it a title. */
import { StyleSheet, Text, View } from "react-native";
import { shape, spacing, typeScale, useThemeColors, type Tone } from "@/theme";

interface BulletListProps {
  tone: Tone;
  items: string[];
}

export function BulletList({ tone, items }: BulletListProps) {
  const colors = useThemeColors();
  if (items.length === 0) return null;
  return (
    <View style={styles.wrap}>
      {items.map((item, index) => (
        <View key={`${index}-${item}`} style={[styles.item, { backgroundColor: colors.muted }]}>
          <Text style={[styles.dot, { color: colors.tone[tone].fg }]}>•</Text>
          <Text style={[styles.text, { color: colors.foreground }]}>{item}</Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    gap: spacing.sm,
  },
  item: {
    flexDirection: "row",
    gap: spacing.sm,
    borderRadius: shape.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  dot: {
    ...typeScale.body,
  },
  text: {
    ...typeScale.body,
    flex: 1,
  },
});

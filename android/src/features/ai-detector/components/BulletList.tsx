// src/features/ai-detector/components/BulletList.tsx
/** Titled bullet list for flagged patterns, suggested changes, and the changes a rewrite made. */
import { StyleSheet, Text, View } from "react-native";
import type { LucideIcon } from "lucide-react-native";
import { radius, spacing, useThemeColors, type Tone } from "@/theme";
import { SectionTitle } from "@/components/tool/SectionTitle";

interface BulletListProps {
  icon: LucideIcon;
  title: string;
  tone: Tone;
  items: string[];
}

export function BulletList({ icon, title, tone, items }: BulletListProps) {
  const colors = useThemeColors();
  if (items.length === 0) return null;
  return (
    <View style={styles.wrap}>
      <SectionTitle icon={icon} title={title} />
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
    borderRadius: radius.lg,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  dot: {
    fontSize: 14,
    lineHeight: 20,
  },
  text: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
  },
});

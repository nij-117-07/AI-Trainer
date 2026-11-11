// src/features/observation-trainer/components/ResultParts.tsx
/** Small pieces shared by the Observation Trainer report: bullet lists and labelled text. */
import { StyleSheet, Text, View } from "react-native";
import { spacing, typeScale, useThemeColors } from "@/theme";

export function BulletList({ items }: { items: string[] }) {
  const colors = useThemeColors();
  if (items.length === 0) return <Text style={[styles.muted, { color: colors.mutedForeground }]}>Nothing listed.</Text>;
  return (
    <View style={styles.list}>
      {items.map((item, index) => (
        <View key={`${item}-${index}`} style={styles.row}>
          <Text style={[styles.bullet, { color: colors.foreground }]}>•</Text>
          <Text style={[styles.body, { color: colors.foreground }]}>{item}</Text>
        </View>
      ))}
    </View>
  );
}

export function LabeledText({ label, body }: { label: string; body: string }) {
  const colors = useThemeColors();
  return (
    <View style={styles.labeled}>
      <Text accessibilityRole="header" style={[styles.label, { color: colors.foreground }]}>
        {label}
      </Text>
      <Text style={[styles.body, { color: colors.mutedForeground }]}>{body || "Nothing was returned."}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  muted: {
    ...typeScale.label,
    fontWeight: "400",
  },
  list: {
    gap: spacing.sm,
  },
  row: {
    flexDirection: "row",
    gap: spacing.sm,
  },
  bullet: {
    ...typeScale.body,
  },
  body: {
    ...typeScale.body,
    flex: 1,
  },
  labeled: {
    gap: spacing.xs,
  },
  label: {
    ...typeScale.body,
    fontWeight: "600",
  },
});

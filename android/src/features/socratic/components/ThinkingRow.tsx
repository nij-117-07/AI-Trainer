// src/features/socratic/components/ThinkingRow.tsx
/** Quiet status line shown where the challenger's reply will appear while it works. */
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import { spacing, typeScale, useThemeColors } from "@/theme";

export function ThinkingRow({ label }: { label: string }) {
  const colors = useThemeColors();
  return (
    <View style={styles.row} accessibilityLiveRegion="polite">
      <ActivityIndicator size="small" color={colors.primary} />
      <Text style={[styles.text, { color: colors.mutedForeground }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  text: {
    ...typeScale.body,
  },
});

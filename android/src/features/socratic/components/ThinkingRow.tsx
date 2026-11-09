// src/features/socratic/components/ThinkingRow.tsx
/** Spinner and status line shown in the chat while the challenger is working. */
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import { spacing, useThemeColors } from "@/theme";

export function ThinkingRow({ label }: { label: string }) {
  const colors = useThemeColors();
  return (
    <View style={styles.row}>
      <ActivityIndicator color={colors.primary} />
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
    fontSize: 14,
  },
});

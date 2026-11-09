// src/features/guides/components/ResultParts.tsx
/** Small result pieces shared by the Learning Guides tabs. */
import { StyleSheet, Text } from "react-native";
import { useThemeColors } from "@/theme";

export function EmptyNote({ message }: { message: string }) {
  const colors = useThemeColors();
  return <Text style={[styles.empty, { color: colors.mutedForeground }]}>{message}</Text>;
}

const styles = StyleSheet.create({
  empty: {
    fontSize: 14,
    lineHeight: 20,
  },
});

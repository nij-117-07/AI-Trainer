// src/features/puzzle/components/ResultParts.tsx
/** Small text piece for the Puzzle Generator: a muted note shown when there is nothing to display yet. */
import { StyleSheet, Text } from "react-native";
import { useThemeColors } from "@/theme";

export function EmptyNote({ message }: { message: string }) {
  const colors = useThemeColors();
  return <Text style={[styles.muted, { color: colors.mutedForeground }]}>{message}</Text>;
}

const styles = StyleSheet.create({
  muted: {
    fontSize: 14,
    lineHeight: 20,
  },
});

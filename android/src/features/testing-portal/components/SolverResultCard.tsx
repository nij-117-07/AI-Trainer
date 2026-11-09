// src/features/testing-portal/components/SolverResultCard.tsx
import { StyleSheet, Text, View } from "react-native";
import { spacing, radius, useThemeColors } from "@/theme";
import { ListenButton } from "@/components/tool/ListenButton";
import type { SolverResult } from "../types";

export function SolverResultCard({ result }: { result: SolverResult }) {
  const colors = useThemeColors();
  return (
    <View style={[styles.box, { backgroundColor: colors.background, borderColor: colors.border }]}>
      <Text style={[styles.heading, { color: colors.foreground }]}>
        Model answer: <Text style={{ color: colors.primary }}>{result.correctOption}</Text>
      </Text>
      <Text selectable style={[styles.body, { color: colors.mutedForeground }]}>
        {result.reasoning}
      </Text>
      <ListenButton text={result.reasoning} label="Reasoning" />
    </View>
  );
}

const styles = StyleSheet.create({
  box: {
    borderWidth: 1,
    borderRadius: radius.lg,
    padding: spacing.lg,
    gap: spacing.sm,
  },
  heading: {
    fontSize: 15,
    fontWeight: "600",
  },
  body: {
    fontSize: 14,
    lineHeight: 21,
  },
});

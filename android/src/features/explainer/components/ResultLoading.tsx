// src/features/explainer/components/ResultLoading.tsx
/** Placeholder shown in the results area while an explainer tool is generating its answer. */
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import { radius, spacing, useThemeColors } from "@/theme";

interface ResultLoadingProps {
  title: string;
  hint: string;
}

export function ResultLoading({ title, hint }: ResultLoadingProps) {
  const colors = useThemeColors();
  return (
    <View
      accessibilityLiveRegion="polite"
      style={[styles.box, { backgroundColor: colors.card, borderColor: colors.border }]}
    >
      <ActivityIndicator color={colors.primary} />
      <Text style={[styles.title, { color: colors.foreground }]}>{title}</Text>
      <Text style={[styles.hint, { color: colors.mutedForeground }]}>{hint}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  box: {
    borderWidth: 1,
    borderRadius: radius.xl,
    padding: spacing.xl,
    alignItems: "center",
    gap: spacing.sm,
  },
  title: {
    fontSize: 16,
    fontWeight: "600",
    textAlign: "center",
  },
  hint: {
    fontSize: 14,
    lineHeight: 20,
    textAlign: "center",
  },
});

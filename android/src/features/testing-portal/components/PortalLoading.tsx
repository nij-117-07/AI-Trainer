// src/features/testing-portal/components/PortalLoading.tsx
/**
 * Placeholder shown while a tool's saved result is read from storage. It appears after 300 ms,
 * so fast reads show no flash, and it is shaped like the result card it stands in for.
 */
import { useEffect, useState } from "react";
import { StyleSheet, View } from "react-native";
import { cardPadding, shape, spacing, useThemeColors } from "@/theme";

const SHOW_DELAY_MS = 300;

export function PortalLoading() {
  const colors = useThemeColors();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setVisible(true), SHOW_DELAY_MS);
    return () => clearTimeout(timer);
  }, []);

  if (!visible) {
    return null;
  }

  return (
    <View accessibilityRole="progressbar" accessibilityLabel="Loading" style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <View style={[styles.line, styles.lineTitle, { backgroundColor: colors.muted }]} />
      <View style={[styles.line, { backgroundColor: colors.muted }]} />
      <View style={[styles.line, styles.lineShort, { backgroundColor: colors.muted }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: cardPadding.compact,
    gap: spacing.md,
    borderWidth: 1,
    borderRadius: shape.lg,
  },
  line: {
    height: 14,
    width: "100%",
    borderRadius: shape.xs,
  },
  lineTitle: {
    height: 18,
    width: "60%",
  },
  lineShort: {
    width: "40%",
  },
});

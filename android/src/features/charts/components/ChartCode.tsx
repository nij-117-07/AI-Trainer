// src/features/charts/components/ChartCode.tsx
/** Scrollable, selectable monospace view of the generated HTML/JS. */
import { ScrollView, StyleSheet, Text } from "react-native";
import { radius, spacing, useThemeColors } from "@/theme";

export function ChartCode({ code }: { code: string }) {
  const colors = useThemeColors();
  return (
    <ScrollView
      style={[styles.box, { borderColor: colors.border, backgroundColor: colors.muted }]}
      nestedScrollEnabled
    >
      <ScrollView horizontal>
        <Text selectable style={[styles.code, { color: colors.foreground }]}>
          {code}
        </Text>
      </ScrollView>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  box: {
    maxHeight: 320,
    borderWidth: 1,
    borderRadius: radius.lg,
    padding: spacing.md,
  },
  code: {
    fontFamily: "monospace",
    fontSize: 12,
    lineHeight: 18,
  },
});

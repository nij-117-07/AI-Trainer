// src/components/tool/StepNavigator.tsx
/** Previous / next controls with a position label and progress bar, for one-by-one views. */
import { Pressable, StyleSheet, Text, View } from "react-native";
import { ChevronLeft, ChevronRight } from "lucide-react-native";
import { radius, spacing, useThemeColors } from "@/theme";
import { Panel } from "@/components/tool/FormControls";

interface StepNavigatorProps {
  index: number;
  total: number;
  onPrevious: () => void;
  onNext: () => void;
}

export function StepNavigator({ index, total, onPrevious, onNext }: StepNavigatorProps) {
  const colors = useThemeColors();
  const isFirst = index === 0;
  const isLast = index >= total - 1;

  return (
    <Panel>
      <View style={styles.row}>
        <Pressable
          onPress={onPrevious}
          disabled={isFirst}
          accessibilityRole="button"
          accessibilityLabel="Previous question"
          style={[styles.button, { borderColor: colors.border, opacity: isFirst ? 0.4 : 1 }]}
        >
          <ChevronLeft size={16} color={colors.foreground} />
          <Text style={[styles.buttonText, { color: colors.foreground }]}>Previous</Text>
        </Pressable>
        <Text style={[styles.count, { color: colors.mutedForeground }]}>
          Question {index + 1} of {total}
        </Text>
        <Pressable
          onPress={onNext}
          disabled={isLast}
          accessibilityRole="button"
          accessibilityLabel="Next question"
          style={[styles.button, { borderColor: colors.border, opacity: isLast ? 0.4 : 1 }]}
        >
          <Text style={[styles.buttonText, { color: colors.foreground }]}>Next</Text>
          <ChevronRight size={16} color={colors.foreground} />
        </Pressable>
      </View>
      <View style={[styles.track, { backgroundColor: colors.muted }]}>
        <View style={[styles.fill, { backgroundColor: colors.primary, width: `${((index + 1) / total) * 100}%` }]} />
      </View>
    </Panel>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing.sm,
  },
  button: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    borderWidth: 1,
    borderRadius: radius.full,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  buttonText: {
    fontSize: 14,
    fontWeight: "500",
  },
  count: {
    flexShrink: 1,
    fontSize: 13,
    textAlign: "center",
  },
  track: {
    height: 4,
    borderRadius: radius.full,
    overflow: "hidden",
  },
  fill: {
    height: "100%",
  },
});

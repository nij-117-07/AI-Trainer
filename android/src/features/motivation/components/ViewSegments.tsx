// src/features/motivation/components/ViewSegments.tsx
/** Two-view segmented control for switching between the Quote and Reflection views in place. */
import { Pressable, StyleSheet, Text, View } from "react-native";
import { shape, spacing, touchTarget, typeScale, useThemeColors } from "@/theme";
import { pointerCursor } from "@/components/tool/FormControls";

interface ViewSegmentsProps<T extends string> {
  label: string;
  options: { value: T; label: string }[];
  value: T;
  onChange: (value: T) => void;
}

export function ViewSegments<T extends string>({ label, options, value, onChange }: ViewSegmentsProps<T>) {
  const colors = useThemeColors();
  return (
    <View
      accessibilityRole="tablist"
      accessibilityLabel={label}
      style={[styles.group, { borderColor: colors.border, backgroundColor: colors.card }]}
    >
      {options.map((option) => {
        const selected = option.value === value;
        return (
          <Pressable
            key={option.value}
            onPress={() => onChange(option.value)}
            accessibilityRole="tab"
            accessibilityLabel={option.label}
            accessibilityState={{ selected }}
            style={[styles.segment, pointerCursor, selected && { backgroundColor: colors.primary }]}
          >
            <Text style={[styles.text, { color: selected ? colors.primaryForeground : colors.foreground }]}>{option.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  group: {
    flexDirection: "row",
    borderWidth: 1,
    borderRadius: shape.full,
    padding: spacing.xs,
  },
  segment: {
    flex: 1,
    minHeight: touchTarget,
    borderRadius: shape.full,
    alignItems: "center",
    justifyContent: "center",
  },
  text: {
    ...typeScale.label,
    fontWeight: "600",
  },
});

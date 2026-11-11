// src/components/tool/CountSlider.tsx
/** Slider for choosing how many items to generate, with the current value shown beside it. */
import { StyleSheet, Text, View } from "react-native";
import Slider from "@react-native-community/slider";
import { spacing, useThemeColors } from "@/theme";
import { Field } from "@/components/tool/FormControls";

interface CountSliderProps {
  label: string;
  min?: number;
  max: number;
  value: number;
  onChange: (value: number) => void;
}

export function CountSlider({ label, min = 1, max, value, onChange }: CountSliderProps) {
  const colors = useThemeColors();
  return (
    <Field label={label}>
      <View style={styles.row}>
        <Slider
          style={styles.slider}
          minimumValue={min}
          maximumValue={max}
          step={1}
          value={value}
          onValueChange={(next) => onChange(Math.round(next))}
          minimumTrackTintColor={colors.primary}
          maximumTrackTintColor={colors.border}
          thumbTintColor={colors.primary}
          accessibilityLabel={label}
          accessibilityValue={{ min, max, now: value }}
        />
        <Text accessibilityElementsHidden style={[styles.value, { color: colors.foreground }]}>
          {value}
        </Text>
      </View>
    </Field>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
  },
  slider: {
    flex: 1,
    height: 44,
  },
  value: {
    minWidth: 28,
    textAlign: "center",
    fontSize: 18,
    fontWeight: "700",
  },
});

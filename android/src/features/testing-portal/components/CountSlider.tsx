// src/features/testing-portal/components/CountSlider.tsx
/** Slider for choosing how many items to generate, with the current value shown beside it. */
import { StyleSheet, Text, View } from "react-native";
import Slider from "@react-native-community/slider";
import { spacing, useThemeColors } from "@/theme";
import { Field } from "./FormControls";

interface CountSliderProps {
  label: string;
  max: number;
  value: number;
  onChange: (value: number) => void;
}

export function CountSlider({ label, max, value, onChange }: CountSliderProps) {
  const colors = useThemeColors();
  return (
    <Field label={label}>
      <View style={styles.row}>
        <Slider
          style={styles.slider}
          minimumValue={1}
          maximumValue={max}
          step={1}
          value={value}
          onValueChange={(next) => onChange(Math.round(next))}
          minimumTrackTintColor={colors.primary}
          maximumTrackTintColor={colors.border}
          thumbTintColor={colors.primary}
        />
        <Text style={[styles.value, { color: colors.foreground }]}>{value}</Text>
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
    height: 40,
  },
  value: {
    minWidth: 28,
    textAlign: "center",
    fontSize: 18,
    fontWeight: "700",
  },
});

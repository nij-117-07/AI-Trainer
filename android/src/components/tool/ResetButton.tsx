/** Header button that clears the form or the current round. Icon only by default. Pass a label to show text beside the icon when one button is not enough to tell the resets apart. accessibilityLabel names the object being reset, for example "Reset form". */
import { Pressable, StyleSheet, Text } from "react-native";
import { RefreshCcw } from "lucide-react-native";
import { shape, spacing, touchTarget, typeScale, useThemeColors } from "@/theme";

export function ResetButton({
  onPress,
  label,
  accessibilityLabel,
}: {
  onPress: () => void;
  label?: string;
  accessibilityLabel?: string;
}) {
  const colors = useThemeColors();
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? label ?? "Reset"}
      style={({ pressed }) => [
        label ? styles.labeled : styles.button,
        { borderColor: colors.border },
        pressed && { backgroundColor: colors.muted },
      ]}
    >
      <RefreshCcw size={20} color={colors.foreground} />
      {label ? <Text style={[styles.text, { color: colors.foreground }]}>{label}</Text> : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    width: touchTarget,
    height: touchTarget,
    borderRadius: shape.full,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  labeled: {
    minHeight: touchTarget,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    borderRadius: shape.full,
    borderWidth: 1,
    paddingHorizontal: spacing.md,
  },
  text: {
    ...typeScale.label,
    fontWeight: "600",
  },
});

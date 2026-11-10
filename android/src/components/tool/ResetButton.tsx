/** Header button that clears the form or the current round. Pass a label to show text beside the icon when one button is not enough to tell the resets apart. */
import { Pressable, StyleSheet, Text } from "react-native";
import { RefreshCcw } from "lucide-react-native";
import { radius, spacing, useThemeColors } from "@/theme";

export function ResetButton({ onPress, label }: { onPress: () => void; label?: string }) {
  const colors = useThemeColors();
  const text = label ?? "Reset";
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={text}
      style={({ pressed }) => [
        label ? styles.labeled : styles.button,
        { borderColor: colors.border },
        pressed && { backgroundColor: colors.muted },
      ]}
    >
      <RefreshCcw size={18} color={colors.foreground} />
      {label ? <Text style={[styles.text, { color: colors.foreground }]}>{label}</Text> : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    width: 40,
    height: 40,
    borderRadius: radius.full,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  labeled: {
    height: 40,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    borderRadius: radius.full,
    borderWidth: 1,
    paddingHorizontal: spacing.md,
  },
  text: {
    fontSize: 13,
    fontWeight: "600",
  },
});

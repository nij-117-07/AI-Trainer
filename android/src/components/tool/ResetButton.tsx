// src/components/tool/ResetButton.tsx
/** Icon button for the screen header that clears the form and the current round. */
import { Pressable, StyleSheet } from "react-native";
import { RefreshCcw } from "lucide-react-native";
import { radius, useThemeColors } from "@/theme";

export function ResetButton({ onPress }: { onPress: () => void }) {
  const colors = useThemeColors();
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel="Reset"
      style={({ pressed }) => [styles.button, { borderColor: colors.border }, pressed && { backgroundColor: colors.muted }]}
    >
      <RefreshCcw size={18} color={colors.foreground} />
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
});

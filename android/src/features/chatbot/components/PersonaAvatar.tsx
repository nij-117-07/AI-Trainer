// src/features/chatbot/components/PersonaAvatar.tsx
/** Round badge showing a persona's emoji. */
import { StyleSheet, Text, View } from "react-native";
import { useThemeColors } from "@/theme";

interface PersonaAvatarProps {
  emoji: string;
  size?: number;
}

export function PersonaAvatar({ emoji, size = 36 }: PersonaAvatarProps) {
  const colors = useThemeColors();
  return (
    <View
      importantForAccessibility="no"
      accessibilityElementsHidden
      style={[styles.avatar, { width: size, height: size, borderRadius: size / 2, backgroundColor: colors.muted }]}
    >
      <Text style={{ fontSize: size * 0.5 }}>{emoji}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  avatar: {
    alignItems: "center",
    justifyContent: "center",
  },
});

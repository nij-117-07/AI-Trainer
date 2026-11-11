// src/components/tool/CopyButton.tsx
/** Compact copy button that puts the given text on the clipboard and shows a confirmation. */
import { useState } from "react";
import { Pressable, StyleSheet, Text } from "react-native";
import { setStringAsync } from "expo-clipboard";
import { Check, Copy } from "lucide-react-native";
import { radius, spacing, useThemeColors } from "@/theme";

export function CopyButton({ text, label = "Copy" }: { text: string; label?: string }) {
  const colors = useThemeColors();
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    await setStringAsync(text);
    setCopied(true);
  }

  return (
    <Pressable
      onPress={handleCopy}
      accessibilityRole="button"
      accessibilityLabel={copied ? "Copied" : label}
      style={({ pressed }) => [
        styles.button,
        { borderColor: colors.border, backgroundColor: colors.card },
        pressed && { backgroundColor: colors.muted },
      ]}
    >
      {copied ? <Check size={16} color={colors.foreground} /> : <Copy size={16} color={colors.foreground} />}
      <Text accessibilityLiveRegion="polite" style={[styles.text, { color: colors.foreground }]}>
        {copied ? "Copied" : "Copy"}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    minHeight: 44,
    borderWidth: 1,
    borderRadius: radius.lg,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  text: {
    fontSize: 13,
    fontWeight: "600",
  },
});

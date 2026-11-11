// src/components/tool/CopyButton.tsx
/**
 * Copy button that puts the given text on the clipboard. Icon only: the copy icon turns into a check
 * for a moment, and the change is announced for screen readers.
 */
import { useEffect, useState } from "react";
import { AccessibilityInfo, Pressable, StyleSheet } from "react-native";
import { setStringAsync } from "expo-clipboard";
import { Check, Copy } from "lucide-react-native";
import { shape, touchTarget, useThemeColors } from "@/theme";
import { pointerCursor } from "@/components/tool/FormControls";

const CONFIRM_MS = 1800;

export function CopyButton({ text, label = "Copy" }: { text: string; label?: string }) {
  const colors = useThemeColors();
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!copied) return;
    const timer = setTimeout(() => setCopied(false), CONFIRM_MS);
    return () => clearTimeout(timer);
  }, [copied]);

  async function handleCopy() {
    await setStringAsync(text);
    setCopied(true);
    AccessibilityInfo.announceForAccessibility(`${label} copied`);
  }

  return (
    <Pressable
      onPress={handleCopy}
      accessibilityRole="button"
      accessibilityLabel={copied ? "Copied" : label}
      style={({ pressed }) => [
        styles.button,
        pointerCursor,
        { borderColor: colors.border, backgroundColor: colors.card },
        pressed && { backgroundColor: colors.muted },
      ]}
    >
      {copied ? <Check size={20} color={colors.foreground} /> : <Copy size={20} color={colors.foreground} />}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    width: touchTarget,
    height: touchTarget,
    borderWidth: 1,
    borderRadius: shape.full,
    alignItems: "center",
    justifyContent: "center",
  },
});

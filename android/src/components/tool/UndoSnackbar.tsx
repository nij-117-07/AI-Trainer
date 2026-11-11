// src/components/tool/UndoSnackbar.tsx
/**
 * Snackbar for a reversible change (DESIGN.md section 7.7). It shows a short sentence and an Undo
 * action, then calls onDismiss after a few seconds. The caller removes the item for real in onDismiss,
 * so Undo only has to put it back. Inside a ToolScreen it is drawn at the bottom of the screen, above
 * the footer, not at the end of the scrolling content.
 */
import { useEffect, useRef } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { shape, spacing, touchTarget, typeScale, useThemeColors } from "@/theme";
import { useSnackbarSlot } from "./snackbar-slot";

const DISMISS_MS = 4000;

interface UndoSnackbarProps {
  message: string;
  onUndo: () => void;
  onDismiss: () => void;
  actionLabel?: string;
}

export function UndoSnackbar({ message, onUndo, onDismiss, actionLabel = "Undo" }: UndoSnackbarProps) {
  const setSlot = useSnackbarSlot();

  const bar = (
    <UndoBar message={message} onUndo={onUndo} onDismiss={onDismiss} actionLabel={actionLabel} floating={setSlot === null} />
  );

  useEffect(() => {
    if (!setSlot) return;
    setSlot(bar);
    return () => setSlot(null);
    // The bar is rebuilt on every render on purpose, so the slot always shows the latest callbacks.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  });

  return setSlot ? null : bar;
}

interface UndoBarProps extends UndoSnackbarProps {
  floating: boolean;
}

function UndoBar({ message, onUndo, onDismiss, actionLabel = "Undo", floating }: UndoBarProps) {
  const colors = useThemeColors();
  const dismissRef = useRef(onDismiss);
  dismissRef.current = onDismiss;

  useEffect(() => {
    const timer = setTimeout(() => dismissRef.current(), DISMISS_MS);
    return () => clearTimeout(timer);
  }, [message]);

  return (
    <View
      accessibilityLiveRegion="polite"
      style={[styles.bar, floating && styles.floating, { backgroundColor: colors.foreground }]}
    >
      <Text style={[styles.message, { color: colors.background }]}>{message}</Text>
      <Pressable
        onPress={onUndo}
        accessibilityRole="button"
        accessibilityLabel={`${actionLabel}: ${message}`}
        style={({ pressed }) => [styles.action, pressed && { opacity: 0.7 }]}
      >
        <Text style={[styles.actionText, { color: colors.tone.sky.fg }]}>{actionLabel}</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    left: spacing.lg,
    right: spacing.lg,
    minHeight: touchTarget,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    paddingLeft: spacing.lg,
    paddingRight: spacing.sm,
    borderRadius: shape.lg,
  },
  floating: {
    position: "absolute",
    bottom: spacing.lg,
  },
  message: {
    flex: 1,
    ...typeScale.label,
    fontWeight: "500",
  },
  action: {
    minHeight: touchTarget,
    minWidth: touchTarget,
    paddingHorizontal: spacing.md,
    alignItems: "center",
    justifyContent: "center",
  },
  actionText: {
    ...typeScale.label,
    fontWeight: "700",
  },
});

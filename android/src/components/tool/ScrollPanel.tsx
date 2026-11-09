// src/components/tool/ScrollPanel.tsx
/**
 * Fixed-height box that scrolls inside the page, so long results do not push the form or the
 * footer out of reach. It scrolls to the end when scrollKey changes, not on first render.
 */
import { useEffect, useRef, type ReactNode } from "react";
import { ScrollView, StyleSheet, useWindowDimensions, type ScrollViewInstance } from "react-native";
import { radius, spacing, useThemeColors } from "@/theme";

interface ScrollPanelProps {
  children: ReactNode;
  scrollKey?: string | number;
}

export function ScrollPanel({ children, scrollKey }: ScrollPanelProps) {
  const colors = useThemeColors();
  const { height } = useWindowDimensions();
  const scrollRef = useRef<ScrollViewInstance>(null);
  const mounted = useRef(false);

  useEffect(() => {
    if (!mounted.current) {
      mounted.current = true;
      return;
    }
    scrollRef.current?.scrollToEnd({ animated: true });
  }, [scrollKey]);

  return (
    <ScrollView
      ref={scrollRef}
      nestedScrollEnabled
      style={[styles.box, { height: Math.max(240, Math.round(height * 0.5)), borderColor: colors.border, backgroundColor: colors.background }]}
      contentContainerStyle={styles.content}
    >
      {children}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  box: {
    borderWidth: 1,
    borderRadius: radius.lg,
  },
  content: {
    gap: spacing.md,
    padding: spacing.md,
  },
});

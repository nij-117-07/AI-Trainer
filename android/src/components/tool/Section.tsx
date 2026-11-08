// src/components/tool/Section.tsx
import type { ReactNode } from "react";
import { StyleSheet, View } from "react-native";
import { spacing } from "@/theme";

/** Vertical stack used by each tab's form and results. */
export function Section({ children }: { children: ReactNode }) {
  return <View style={styles.section}>{children}</View>;
}

const styles = StyleSheet.create({
  section: {
    gap: spacing.lg,
  },
});

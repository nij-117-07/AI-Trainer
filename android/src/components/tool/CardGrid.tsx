// src/components/tool/CardGrid.tsx
/**
 * Lays out a list of cards in one column on a phone, two on a tablet, and three on desktop.
 */
import { Children, type ReactNode } from "react";
import { StyleSheet, View } from "react-native";
import { spacing, useLayout, type LayoutSize } from "@/theme";

const COLUMN_WIDTH: Record<LayoutSize, `${number}%`> = {
  phone: "100%",
  tablet: "48.5%",
  desktop: "32%",
};

export function CardGrid({ children }: { children: ReactNode }) {
  const { size } = useLayout();
  return (
    <View style={styles.grid}>
      {Children.toArray(children).map((child, index) => (
        <View key={index} style={{ width: COLUMN_WIDTH[size] }}>
          {child}
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    rowGap: spacing.lg,
  },
});

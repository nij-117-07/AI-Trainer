// src/features/testing-portal/components/PortalLoading.tsx
/** Spinner shown while a tool's saved result is read from storage. */
import { ActivityIndicator, StyleSheet, View } from "react-native";
import { spacing, useThemeColors } from "@/theme";

export function PortalLoading() {
  const colors = useThemeColors();
  return (
    <View style={styles.box}>
      <ActivityIndicator accessibilityLabel="Loading" color={colors.primary} />
    </View>
  );
}

const styles = StyleSheet.create({
  box: {
    alignItems: "center",
    paddingVertical: spacing["2xl"],
  },
});

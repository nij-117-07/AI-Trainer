// src/features/language-profiles/components/ActiveLanguageNotice.tsx
/** Shows the active language pair inside a sub-app, with a shortcut to change it. */
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { Languages } from "lucide-react-native";
import { radius, spacing, useThemeColors } from "@/theme";
import { useLanguageProfiles } from "../providers/LanguageProfilesProvider";
import { describePair } from "../lib/profiles";

export function ActiveLanguageNotice() {
  const colors = useThemeColors();
  const router = useRouter();
  const { activeProfile } = useLanguageProfiles();

  return (
    <View style={[styles.row, { backgroundColor: colors.muted, borderColor: colors.border }]}>
      <Languages size={18} color={colors.foreground} />
      <View style={styles.text}>
        <Text style={[styles.label, { color: colors.mutedForeground }]}>Language profile · {activeProfile.name}</Text>
        <Text style={[styles.pair, { color: colors.foreground }]}>{describePair(activeProfile)}</Text>
      </View>
      <Pressable
        onPress={() => router.push("/language-learner/profiles")}
        accessibilityRole="button"
        accessibilityLabel="Change language profile"
        style={({ pressed }) => [styles.change, { borderColor: colors.border }, pressed && { opacity: 0.85 }]}
      >
        <Text style={[styles.changeText, { color: colors.foreground }]}>Change</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    borderWidth: 1,
    borderRadius: radius.lg,
    padding: spacing.md,
  },
  text: {
    flex: 1,
    gap: 2,
  },
  label: {
    fontSize: 12,
  },
  pair: {
    fontSize: 15,
    fontWeight: "600",
  },
  change: {
    borderWidth: 1,
    borderRadius: radius.full,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    minHeight: 36,
    justifyContent: "center",
  },
  changeText: {
    fontSize: 13,
    fontWeight: "600",
  },
});

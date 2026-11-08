// src/features/language-learner/components/LanguageLearnerMenu.tsx
/**
 * Language Learner landing page: one small box per sub-app. Tapping a box opens that sub-app.
 */
import { Pressable, StyleSheet, Text, View, useWindowDimensions } from "react-native";
import { useRouter } from "expo-router";
import { breakpoints, radius, spacing, useThemeColors } from "@/theme";
import { ToolScreen } from "@/components/tool/ToolScreen";
import { LANGUAGE_TOOLS } from "../data/tools";

export function LanguageLearnerMenu() {
  const colors = useThemeColors();
  const router = useRouter();
  const { width } = useWindowDimensions();
  const boxWidth = width >= breakpoints.tablet ? "48.5%" : "100%";

  return (
    <ToolScreen title="Language Learner">
      <View style={styles.grid}>
        {LANGUAGE_TOOLS.map((tool) => {
          const Icon = tool.icon;
          const tone = colors.tone[tool.tone];
          return (
            <Pressable
              key={tool.key}
              onPress={() => router.push(tool.route as never)}
              accessibilityRole="button"
              accessibilityLabel={`Open ${tool.title}`}
              style={({ pressed }) => [
                styles.box,
                { width: boxWidth, backgroundColor: tone.bg, borderColor: tone.border },
                pressed && { opacity: 0.85 },
              ]}
            >
              <View style={[styles.iconTile, { backgroundColor: colors.card, borderColor: tone.border }]}>
                <Icon size={20} color={tone.fg} />
              </View>
              <Text style={[styles.title, { color: colors.foreground }]}>{tool.title}</Text>
              <Text style={[styles.description, { color: colors.mutedForeground }]}>{tool.description}</Text>
            </Pressable>
          );
        })}
      </View>
    </ToolScreen>
  );
}

const styles = StyleSheet.create({
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    gap: spacing.lg,
  },
  box: {
    borderWidth: 1,
    borderRadius: radius["2xl"],
    padding: spacing.xl,
    gap: spacing.md,
  },
  iconTile: {
    width: 44,
    height: 44,
    borderRadius: radius.lg,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    fontSize: 18,
    fontWeight: "600",
  },
  description: {
    fontSize: 14,
    lineHeight: 21,
  },
});

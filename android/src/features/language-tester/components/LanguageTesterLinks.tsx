// src/features/language-tester/components/LanguageTesterLinks.tsx
/** Row of links to the other Language Tester pages, shown above the assessment. */
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { Bot, Repeat, TextCursorInput, type LucideIcon } from "lucide-react-native";
import { radius, spacing, useThemeColors } from "@/theme";

const LINKS: { title: string; route: string; icon: LucideIcon }[] = [
  { title: "Fill in the Blank", route: "/language-learner/language-tester/fib", icon: TextCursorInput },
  { title: "Translation Challenge", route: "/language-learner/language-tester/challenge", icon: Repeat },
  { title: "Roleplay Coach", route: "/language-learner/language-tester/roleplay", icon: Bot },
];

export function LanguageTesterLinks() {
  const colors = useThemeColors();
  const router = useRouter();

  return (
    <View style={styles.row}>
      {LINKS.map((link) => {
        const Icon = link.icon;
        return (
          <Pressable
            key={link.route}
            onPress={() => router.push(link.route as never)}
            accessibilityRole="link"
            accessibilityLabel={`Open ${link.title}`}
            style={({ pressed }) => [
              styles.link,
              { borderColor: colors.border, backgroundColor: colors.card },
              pressed && { opacity: 0.85 },
            ]}
          >
            <Icon size={16} color={colors.primary} />
            <Text style={[styles.text, { color: colors.foreground }]}>{link.title}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
  },
  link: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    borderWidth: 1,
    borderRadius: radius.full,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  text: {
    fontSize: 14,
    fontWeight: "500",
  },
});

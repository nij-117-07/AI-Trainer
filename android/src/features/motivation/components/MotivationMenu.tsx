// src/features/motivation/components/MotivationMenu.tsx
/**
 * Motivation & Reflection landing page: one small box per tool. Tapping a box opens that tool.
 */
import { Pressable, StyleSheet, Text, View, useWindowDimensions } from "react-native";
import { useRouter } from "expo-router";
import { NotebookPen, Quote, type LucideIcon } from "lucide-react-native";
import { breakpoints, radius, spacing, useThemeColors, type Tone } from "@/theme";
import { ToolScreen } from "@/components/tool/ToolScreen";

interface MotivationTool {
  key: string;
  title: string;
  description: string;
  route: string;
  icon: LucideIcon;
  tone: Tone;
}

const TOOLS: MotivationTool[] = [
  {
    key: "quote",
    title: "Quote",
    description: "A personal quote matched to how you feel, plus one micro-action you can take today.",
    route: "/learning/motivation/quote",
    icon: Quote,
    tone: "amber",
  },
  {
    key: "reflect",
    title: "Reflection",
    description: "Three deep journaling prompts and a perspective shift for the challenge you face.",
    route: "/learning/motivation/reflect",
    icon: NotebookPen,
    tone: "sky",
  },
];

export function MotivationMenu() {
  const colors = useThemeColors();
  const router = useRouter();
  const { width } = useWindowDimensions();
  const boxWidth = width >= breakpoints.tablet ? "48.5%" : "100%";

  return (
    <ToolScreen title="Motivation & Reflection">
      <View style={styles.grid}>
        {TOOLS.map((tool) => {
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

// src/features/explainer/components/ExplainerMenu.tsx
/**
 * Explainer landing page: one small box per tool. Tapping a box opens that tool.
 */
import { Pressable, StyleSheet, Text, View, useWindowDimensions } from "react-native";
import { useRouter } from "expo-router";
import { BookOpenText, ChevronRight, GraduationCap, Lightbulb, Puzzle, type LucideIcon } from "lucide-react-native";
import { breakpoints, radius, spacing, useThemeColors, type Tone } from "@/theme";
import { ToolScreen } from "@/components/tool/ToolScreen";

interface ExplainerTool {
  key: string;
  title: string;
  description: string;
  route: string;
  icon: LucideIcon;
  tone: Tone;
}

const TOOLS: ExplainerTool[] = [
  {
    key: "explain",
    title: "Quick Explain",
    description: "A clear explanation of any topic at your level, plus a one-line takeaway.",
    route: "/learning/explainer/explain",
    icon: Lightbulb,
    tone: "amber",
  },
  {
    key: "atoz",
    title: "A-to-Z Tutorial",
    description: "A complete, step-by-step tutorial that takes any topic from basics to advanced.",
    route: "/learning/explainer/atoz",
    icon: BookOpenText,
    tone: "sky",
  },
  {
    key: "feynman",
    title: "Feynman",
    description: "Explain hard ideas in plain words, with metaphors pitched to the age you choose.",
    route: "/learning/explainer/feynman",
    icon: Puzzle,
    tone: "rose",
  },
  {
    key: "socratic",
    title: "Socratic Mentor",
    description: "Answer guided questions with optional hints, so you reach the answer yourself.",
    route: "/learning/explainer/socratic",
    icon: GraduationCap,
    tone: "rose",
  },
];

export function ExplainerMenu() {
  const colors = useThemeColors();
  const router = useRouter();
  const { width } = useWindowDimensions();
  const boxWidth = width >= breakpoints.tablet ? "48.5%" : "100%";

  return (
    <ToolScreen title="Explainer Tools" wide>
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
              <View style={styles.header}>
                <View style={[styles.iconTile, { backgroundColor: colors.card, borderColor: tone.border }]}>
                  <Icon size={20} color={tone.fg} />
                </View>
                <ChevronRight size={18} color={colors.mutedForeground} />
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
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
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

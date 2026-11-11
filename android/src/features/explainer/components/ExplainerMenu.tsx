// src/features/explainer/components/ExplainerMenu.tsx
/**
 * Explainer landing page: one card per tool. The whole card opens that tool.
 */
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { BookOpenText, ChevronRight, GraduationCap, Lightbulb, Puzzle, type LucideIcon } from "lucide-react-native";
import { cardPadding, shape, spacing, touchTarget, typeScale, useThemeColors, type Tone } from "@/theme";
import { CardGrid } from "@/components/tool/CardGrid";
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
    description: "A clear answer at your level, with a one-line takeaway.",
    route: "/learning/explainer/explain",
    icon: Lightbulb,
    tone: "amber",
  },
  {
    key: "atoz",
    title: "A-to-Z Tutorial",
    description: "A step-by-step course from basics to advanced.",
    route: "/learning/explainer/atoz",
    icon: BookOpenText,
    tone: "sky",
  },
  {
    key: "feynman",
    title: "Feynman",
    description: "Hard ideas in plain words, with simple metaphors.",
    route: "/learning/explainer/feynman",
    icon: Puzzle,
    tone: "emerald",
  },
  {
    key: "socratic",
    title: "Socratic Mentor",
    description: "Guided questions that lead you to the answer.",
    route: "/learning/explainer/socratic",
    icon: GraduationCap,
    tone: "rose",
  },
];

export function ExplainerMenu() {
  const colors = useThemeColors();
  const router = useRouter();

  return (
    <ToolScreen title="Explainer Tools" wide>
      <CardGrid>
        {TOOLS.map((tool) => {
          const Icon = tool.icon;
          const tone = colors.tone[tool.tone];
          return (
            <Pressable
              key={tool.key}
              onPress={() => router.push(tool.route as never)}
              accessibilityRole="button"
              accessibilityLabel={`Open ${tool.title}`}
              accessibilityHint={tool.description}
              style={({ pressed }) => [
                styles.card,
                { backgroundColor: colors.card, borderColor: colors.border },
                pressed && { backgroundColor: colors.muted },
              ]}
            >
              <View style={[styles.iconTile, { backgroundColor: tone.bg }]}>
                <Icon size={20} color={tone.fg} />
              </View>
              <View style={styles.body}>
                <Text style={[styles.title, { color: colors.foreground }]}>{tool.title}</Text>
                <Text style={[styles.description, { color: colors.mutedForeground }]}>{tool.description}</Text>
              </View>
              <ChevronRight size={20} color={colors.mutedForeground} />
            </Pressable>
          );
        })}
      </CardGrid>
    </ToolScreen>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.lg,
    minHeight: touchTarget,
    padding: cardPadding.compact,
    borderWidth: 1,
    borderRadius: shape.lg,
  },
  iconTile: {
    width: 40,
    height: 40,
    borderRadius: shape.md,
    alignItems: "center",
    justifyContent: "center",
  },
  body: {
    flex: 1,
    gap: spacing.xs,
  },
  title: {
    ...typeScale.title,
  },
  description: {
    ...typeScale.body,
  },
});

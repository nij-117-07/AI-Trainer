// src/features/testing-portal/components/TestingPortalMenu.tsx
/**
 * Testing Portal landing page: one card per tool. The whole card opens that tool.
 */
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { BookOpen, Brain, ChevronRight, Gauge, ListChecks, Target, type LucideIcon } from "lucide-react-native";
import { cardPadding, shape, spacing, touchTarget, typeScale, useThemeColors, type Tone } from "@/theme";
import { CardGrid } from "@/components/tool/CardGrid";
import { ToolScreen } from "@/components/tool/ToolScreen";

interface PortalTool {
  key: string;
  title: string;
  description: string;
  route: string;
  icon: LucideIcon;
  tone: Tone;
}

const TOOLS: PortalTool[] = [
  {
    key: "mcq",
    title: "MCQs",
    description: "Make multiple-choice questions and check answers.",
    route: "/practice/testing-portal/mcq",
    icon: ListChecks,
    tone: "sky",
  },
  {
    key: "theoretical",
    title: "Theoretical",
    description: "Open-ended questions with your own criteria.",
    route: "/practice/testing-portal/theoretical",
    icon: Brain,
    tone: "rose",
  },
  {
    key: "answer",
    title: "Expert answer",
    description: "Write a detailed answer to a technical question.",
    route: "/practice/testing-portal/answer",
    icon: BookOpen,
    tone: "amber",
  },
  {
    key: "solver",
    title: "Solve an MCQ",
    description: "Paste a question and get the correct option.",
    route: "/practice/testing-portal/solver",
    icon: Target,
    tone: "emerald",
  },
  {
    key: "grader",
    title: "Performance Grader",
    description: "Score a written answer or image against a goal.",
    route: "/practice/testing-portal/grader",
    icon: Gauge,
    tone: "sky",
  },
];

export function TestingPortalMenu() {
  const colors = useThemeColors();
  const router = useRouter();

  return (
    <ToolScreen title="Testing Portal" wide>
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

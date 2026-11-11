// src/features/testing-portal/components/TestingPortalMenu.tsx
/**
 * Testing Portal landing page: one small box per tool. Tapping a box opens that tool.
 */
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { BookOpen, Brain, Gauge, ListChecks, Target, type LucideIcon } from "lucide-react-native";
import { radius, spacing, useThemeColors, type Tone } from "@/theme";
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
    description: "Generate multiple choice questions and answer them with instant feedback.",
    route: "/practice/testing-portal/mcq",
    icon: ListChecks,
    tone: "sky",
  },
  {
    key: "theoretical",
    title: "Theoretical",
    description: "Open-ended questions with a focus area and evaluation criteria.",
    route: "/practice/testing-portal/theoretical",
    icon: Brain,
    tone: "rose",
  },
  {
    key: "answer",
    title: "Expert answer",
    description: "Write a detailed answer to a theoretical or technical question.",
    route: "/practice/testing-portal/answer",
    icon: BookOpen,
    tone: "amber",
  },
  {
    key: "solver",
    title: "Solve an MCQ",
    description: "Paste a question with its options and get the correct option with reasoning.",
    route: "/practice/testing-portal/solver",
    icon: Target,
    tone: "emerald",
  },
  {
    key: "grader",
    title: "Performance Grader",
    description: "Grade a written answer or image against a target objective and see your score.",
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
                styles.box,
                { backgroundColor: tone.bg, borderColor: tone.border },
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
      </CardGrid>
    </ToolScreen>
  );
}

const styles = StyleSheet.create({
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

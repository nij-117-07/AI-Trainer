// src/features/guides/components/GuidesMenu.tsx
/**
 * Learning Guides landing page: one small box per tool. Tapping a box opens that tool.
 */
import { Pressable, StyleSheet, Text, View, useWindowDimensions } from "react-native";
import { useRouter } from "expo-router";
import {
  CalendarDays,
  DraftingCompass,
  FolderGit2,
  Lightbulb,
  ListChecks,
  type LucideIcon,
} from "lucide-react-native";
import { breakpoints, radius, spacing, useThemeColors, type Tone } from "@/theme";
import { ToolScreen } from "@/components/tool/ToolScreen";

interface GuideTool {
  key: string;
  title: string;
  description: string;
  route: string;
  icon: LucideIcon;
  tone: Tone;
}

const TOOLS: GuideTool[] = [
  {
    key: "task",
    title: "Guide Tasks",
    description: "Get mentor feedback and a set of actionable tasks that push you toward your goal.",
    route: "/learning/guides/task",
    icon: ListChecks,
    tone: "amber",
  },
  {
    key: "daily-plan",
    title: "Daily Study Plan",
    description: "A structured roadmap, mastery gap analysis, and a recommended exercise for today.",
    route: "/learning/guides/daily-plan",
    icon: CalendarDays,
    tone: "sky",
  },
  {
    key: "project-blueprint",
    title: "Project Blueprint",
    description: "A unique, industry-specific project with technical requirements and stretch goals.",
    route: "/learning/guides/project-blueprint",
    icon: DraftingCompass,
    tone: "emerald",
  },
  {
    key: "suggest-topics",
    title: "Topic Suggestions",
    description: "Next-topic recommendations that build on what you know, without repeating past ideas.",
    route: "/learning/guides/suggest-topics",
    icon: Lightbulb,
    tone: "rose",
  },
  {
    key: "suggest-projects",
    title: "Project Suggestions",
    description: "Strategic project use cases for a technology and industry pairing.",
    route: "/learning/guides/suggest-projects",
    icon: FolderGit2,
    tone: "sky",
  },
];

export function GuidesMenu() {
  const colors = useThemeColors();
  const router = useRouter();
  const { width } = useWindowDimensions();
  const boxWidth = width >= breakpoints.tablet ? "48.5%" : "100%";

  return (
    <ToolScreen title="Learning Guides">
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

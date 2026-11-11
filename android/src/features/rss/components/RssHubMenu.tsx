// src/features/rss/components/RssHubMenu.tsx
/** RSS Feed landing page: one row each for the Viewer (read articles) and the Manager (configure feeds). */
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { ChevronRight, Newspaper, Settings2, type LucideIcon } from "lucide-react-native";
import { cardPadding, shape, spacing, typeScale, useThemeColors, type Tone } from "@/theme";
import { CardGrid } from "@/components/tool/CardGrid";
import { ToolScreen } from "@/components/tool/ToolScreen";

interface HubLink {
  key: string;
  title: string;
  description: string;
  route: string;
  icon: LucideIcon;
  tone: Tone;
}

const LINKS: HubLink[] = [
  {
    key: "viewer",
    title: "RSS Viewer",
    description: "Read the latest articles from your feeds.",
    route: "/tools/rss/viewer",
    icon: Newspaper,
    tone: "sky",
  },
  {
    key: "manager",
    title: "RSS Manager",
    description: "Add, edit, and test feed sources.",
    route: "/tools/rss/manager",
    icon: Settings2,
    tone: "amber",
  },
];

export function RssHubMenu() {
  const colors = useThemeColors();
  const router = useRouter();

  return (
    <ToolScreen title="RSS Feed" usesAi={false} wide>
      <CardGrid>
        {LINKS.map((link) => {
          const Icon = link.icon;
          const tone = colors.tone[link.tone];
          return (
            <Pressable
              key={link.key}
              onPress={() => router.push(link.route as never)}
              accessibilityRole="button"
              accessibilityLabel={`Open ${link.title}`}
              style={({ pressed }) => [
                styles.card,
                { backgroundColor: colors.card, borderColor: colors.border },
                pressed && { backgroundColor: colors.muted },
              ]}
            >
              <View style={[styles.iconTile, { backgroundColor: tone.bg }]}>
                <Icon size={22} color={tone.fg} />
              </View>
              <View style={styles.text}>
                <Text style={[styles.title, { color: colors.foreground }]}>{link.title}</Text>
                <Text style={[styles.description, { color: colors.mutedForeground }]}>{link.description}</Text>
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
    gap: spacing.md,
    borderWidth: 1,
    borderRadius: shape.lg,
    padding: cardPadding.compact,
  },
  iconTile: {
    width: 48,
    height: 48,
    borderRadius: shape.md,
    alignItems: "center",
    justifyContent: "center",
  },
  text: {
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

// src/features/rss/components/RssHubMenu.tsx
/** RSS Feed landing page: one card each for the Viewer (read articles) and the Manager (configure feeds). */
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { Newspaper, Settings2, type LucideIcon } from "lucide-react-native";
import { radius, spacing, useThemeColors, type Tone } from "@/theme";
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
    description: "Browse, search, and filter the latest articles from your channels.",
    route: "/tools/rss/viewer",
    icon: Newspaper,
    tone: "sky",
  },
  {
    key: "manager",
    title: "RSS Manager",
    description: "Add, edit, enable, and fetch the RSS and Atom providers.",
    route: "/tools/rss/manager",
    icon: Settings2,
    tone: "amber",
  },
];

export function RssHubMenu() {
  const colors = useThemeColors();
  const router = useRouter();

  return (
    <ToolScreen title="RSS Feed">
      <View style={styles.list}>
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
                { backgroundColor: tone.bg, borderColor: tone.border },
                pressed && { opacity: 0.85 },
              ]}
            >
              <View style={[styles.iconTile, { backgroundColor: colors.card, borderColor: tone.border }]}>
                <Icon size={20} color={tone.fg} />
              </View>
              <Text style={[styles.title, { color: colors.foreground }]}>{link.title}</Text>
              <Text style={[styles.description, { color: colors.mutedForeground }]}>{link.description}</Text>
            </Pressable>
          );
        })}
      </View>
    </ToolScreen>
  );
}

const styles = StyleSheet.create({
  list: {
    gap: spacing.lg,
  },
  card: {
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

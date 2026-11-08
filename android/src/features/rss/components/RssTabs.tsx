// src/features/rss/components/RssTabs.tsx
/** Viewer and Manager switcher shown at the top of both RSS screens. */
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { LayoutGrid, Settings2, type LucideIcon } from "lucide-react-native";
import { radius, spacing, useThemeColors } from "@/theme";

export type RssView = "viewer" | "manager";

const TABS: { key: RssView; label: string; route: string; icon: LucideIcon }[] = [
  { key: "viewer", label: "Viewer", route: "/tools/rss/viewer", icon: LayoutGrid },
  { key: "manager", label: "Manager", route: "/tools/rss/manager", icon: Settings2 },
];

export function RssTabs({ active }: { active: RssView }) {
  const colors = useThemeColors();
  const router = useRouter();

  return (
    <View accessibilityRole="tablist" style={[styles.bar, { backgroundColor: colors.muted, borderColor: colors.border }]}>
      {TABS.map((tab) => {
        const selected = tab.key === active;
        const Icon = tab.icon;
        const tint = selected ? colors.foreground : colors.mutedForeground;
        return (
          <Pressable
            key={tab.key}
            onPress={() => {
              if (!selected) router.replace(tab.route as never);
            }}
            accessibilityRole="tab"
            accessibilityState={{ selected }}
            style={[styles.tab, selected && { backgroundColor: colors.card }]}
          >
            <Icon size={16} color={tint} />
            <Text style={[styles.label, { color: tint }]}>{tab.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: "row",
    alignSelf: "flex-start",
    gap: spacing.xs,
    borderWidth: 1,
    borderRadius: radius.xl,
    padding: spacing.xs,
  },
  tab: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    borderRadius: radius.lg,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
  },
});

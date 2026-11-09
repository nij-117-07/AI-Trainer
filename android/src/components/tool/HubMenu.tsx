// src/components/tool/HubMenu.tsx
/**
 * Hub landing page: one small box per app in an area. Tapping a box opens that app.
 */
import { Pressable, StyleSheet, Text, View, useWindowDimensions } from "react-native";
import { useRouter } from "expo-router";
import { breakpoints, radius, spacing, useThemeColors, type Tone } from "@/theme";
import { ToolScreen } from "@/components/tool/ToolScreen";
import type { LucideIcon } from "lucide-react-native";

export interface HubItem {
  key: string;
  title: string;
  description: string;
  route: string;
  icon: LucideIcon;
  tone: Tone;
}

interface HubMenuProps {
  title: string;
  items: HubItem[];
}

export function HubMenu({ title, items }: HubMenuProps) {
  const colors = useThemeColors();
  const router = useRouter();
  const { width } = useWindowDimensions();
  const boxWidth = width >= breakpoints.tablet ? "48.5%" : "100%";

  return (
    <ToolScreen title={title}>
      <View style={styles.grid}>
        {items.map((item) => {
          const Icon = item.icon;
          const tone = colors.tone[item.tone];
          return (
            <Pressable
              key={item.key}
              onPress={() => router.push(item.route as never)}
              accessibilityRole="button"
              accessibilityLabel={`Open ${item.title}`}
              style={({ pressed }) => [
                styles.box,
                { width: boxWidth, backgroundColor: tone.bg, borderColor: tone.border },
                pressed && { opacity: 0.85 },
              ]}
            >
              <View style={[styles.iconTile, { backgroundColor: colors.card, borderColor: tone.border }]}>
                <Icon size={20} color={tone.fg} />
              </View>
              <Text style={[styles.itemTitle, { color: colors.foreground }]}>{item.title}</Text>
              <Text style={[styles.description, { color: colors.mutedForeground }]}>{item.description}</Text>
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
  itemTitle: {
    fontSize: 18,
    fontWeight: "600",
  },
  description: {
    fontSize: 14,
    lineHeight: 21,
  },
});

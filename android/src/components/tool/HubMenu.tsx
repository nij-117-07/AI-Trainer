// src/components/tool/HubMenu.tsx
/**
 * Hub landing page: one small box per app in an area. Tapping a box opens that app.
 */
import { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { radius, spacing, useThemeColors, type Tone } from "@/theme";
import { ToolScreen } from "@/components/tool/ToolScreen";
import { TextField } from "@/components/tool/FormControls";
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
  const [query, setQuery] = useState("");
  const search = query.trim().toLowerCase();
  const visible = search
    ? items.filter((item) => `${item.title} ${item.description}`.toLowerCase().includes(search))
    : items;

  return (
    <ToolScreen title={title}>
      {items.length > 6 && (
        <TextField
          label="Search"
          placeholder="Find a tool…"
          value={query}
          onChangeText={setQuery}
          maxLength={100}
        />
      )}
      <View style={styles.grid}>
        {visible.map((item) => {
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
                { backgroundColor: tone.bg, borderColor: tone.border },
                pressed && { opacity: 0.85 },
              ]}
            >
              <View style={[styles.iconTile, { backgroundColor: colors.card, borderColor: tone.border }]}>
                <Icon size={18} color={tone.fg} />
              </View>
              <Text style={[styles.itemTitle, { color: colors.foreground }]} numberOfLines={2}>
                {item.title}
              </Text>
              <Text style={[styles.description, { color: colors.mutedForeground }]} numberOfLines={2}>
                {item.description}
              </Text>
            </Pressable>
          );
        })}
      </View>
      {visible.length === 0 && (
        <Text style={[styles.empty, { color: colors.mutedForeground }]}>No tools match “{query.trim()}”.</Text>
      )}
    </ToolScreen>
  );
}

const styles = StyleSheet.create({
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    gap: spacing.md,
  },
  box: {
    width: "48%",
    borderWidth: 1,
    borderRadius: radius["2xl"],
    padding: spacing.md,
    gap: spacing.sm,
  },
  iconTile: {
    width: 36,
    height: 36,
    borderRadius: radius.lg,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  itemTitle: {
    fontSize: 15,
    fontWeight: "600",
  },
  description: {
    fontSize: 12,
    lineHeight: 17,
  },
  empty: {
    fontSize: 14,
    textAlign: "center",
    paddingVertical: spacing.lg,
  },
});

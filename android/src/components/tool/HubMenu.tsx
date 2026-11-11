// src/components/tool/HubMenu.tsx
/**
 * Hub landing page: one compact tile per app in an area. Tapping a tile opens that app. A search field
 * appears only when there are enough apps to need one.
 */
import { useState } from "react";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { useRouter } from "expo-router";
import { X, Search } from "lucide-react-native";
import { shape, spacing, touchTarget, typeScale, useLayout, useThemeColors, type LayoutSize, type Tone } from "@/theme";
import { ToolScreen } from "@/components/tool/ToolScreen";
import { pointerCursor } from "@/components/tool/FormControls";
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

const SEARCH_THRESHOLD = 8;

const TILE_WIDTH: Record<LayoutSize, `${number}%`> = {
  phone: "48.5%",
  tablet: "31.5%",
  desktop: "23.5%",
};

export function HubMenu({ title, items }: HubMenuProps) {
  const colors = useThemeColors();
  const router = useRouter();
  const { size } = useLayout();
  const [query, setQuery] = useState("");
  const search = query.trim().toLowerCase();
  const visible = search
    ? items.filter((item) => `${item.title} ${item.description}`.toLowerCase().includes(search))
    : items;

  return (
    <ToolScreen title={title} wide>
      {items.length > SEARCH_THRESHOLD && (
        <View style={[styles.search, { borderColor: colors.border, backgroundColor: colors.card }]}>
          <Search size={20} color={colors.mutedForeground} />
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder="Find a tool"
            placeholderTextColor={colors.mutedForeground}
            accessibilityLabel="Find a tool"
            maxLength={100}
            returnKeyType="search"
            autoCorrect={false}
            style={[styles.searchInput, { color: colors.foreground }]}
          />
          {query ? (
            <Pressable
              onPress={() => setQuery("")}
              accessibilityRole="button"
              accessibilityLabel="Clear search"
              style={({ pressed }) => [styles.clear, pointerCursor, pressed && { backgroundColor: colors.muted }]}
            >
              <X size={20} color={colors.foreground} />
            </Pressable>
          ) : null}
        </View>
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
              accessibilityHint={item.description}
              style={({ pressed }) => [
                styles.tile,
                pointerCursor,
                { width: TILE_WIDTH[size], backgroundColor: colors.card, borderColor: colors.border },
                pressed && { backgroundColor: colors.muted },
              ]}
            >
              <View style={[styles.iconTile, { backgroundColor: tone.bg }]}>
                <Icon size={22} color={tone.fg} />
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
  search: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    minHeight: touchTarget,
    borderWidth: 1,
    borderRadius: shape.lg,
    paddingLeft: spacing.lg,
    paddingRight: spacing.xs,
  },
  searchInput: {
    flex: 1,
    ...typeScale.body,
    paddingVertical: spacing.md,
  },
  clear: {
    width: touchTarget,
    height: touchTarget,
    borderRadius: shape.full,
    alignItems: "center",
    justifyContent: "center",
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    gap: spacing.sm,
  },
  tile: {
    minHeight: 136,
    borderWidth: 1,
    borderRadius: shape.lg,
    padding: spacing.md,
    gap: spacing.xs,
  },
  iconTile: {
    width: 40,
    height: 40,
    borderRadius: shape.md,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.xs,
  },
  itemTitle: {
    ...typeScale.label,
    fontWeight: "600",
  },
  description: {
    ...typeScale.caption,
    fontWeight: "400",
  },
  empty: {
    ...typeScale.body,
    textAlign: "center",
    paddingVertical: spacing.lg,
  },
});

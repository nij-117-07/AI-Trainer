// src/features/language-learner/components/LanguageLearnerMenu.tsx
/**
 * Language Learner landing page: one card per sub-app. The whole card opens that sub-app. A search field
 * appears only when there are enough sub-apps to need one.
 */
import { useState } from "react";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { useRouter } from "expo-router";
import { ChevronRight, Search, X } from "lucide-react-native";
import { cardPadding, shape, spacing, touchTarget, typeScale, useThemeColors } from "@/theme";
import { CardGrid } from "@/components/tool/CardGrid";
import { ToolScreen } from "@/components/tool/ToolScreen";
import { pointerCursor } from "@/components/tool/FormControls";
import { LANGUAGE_TOOLS } from "../data/tools";

const SEARCH_THRESHOLD = 8;

export function LanguageLearnerMenu() {
  const colors = useThemeColors();
  const router = useRouter();
  const [query, setQuery] = useState("");
  const search = query.trim().toLowerCase();
  const visible = search
    ? LANGUAGE_TOOLS.filter((tool) => `${tool.title} ${tool.description}`.toLowerCase().includes(search))
    : LANGUAGE_TOOLS;

  return (
    <ToolScreen title="Language Learner" usesAi={false} wide>
      {LANGUAGE_TOOLS.length > SEARCH_THRESHOLD && (
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
      <CardGrid>
        {visible.map((tool) => {
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
                pointerCursor,
                { backgroundColor: colors.card, borderColor: colors.border },
                pressed && { backgroundColor: colors.muted },
              ]}
            >
              <View style={[styles.iconTile, { backgroundColor: tone.bg }]}>
                <Icon size={20} color={tone.fg} />
              </View>
              <View style={styles.body}>
                <Text style={[styles.title, { color: colors.foreground }]}>{tool.title}</Text>
                <Text style={[styles.description, { color: colors.mutedForeground }]} numberOfLines={1}>
                  {tool.description}
                </Text>
              </View>
              <ChevronRight size={20} color={colors.mutedForeground} />
            </Pressable>
          );
        })}
      </CardGrid>
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
  empty: {
    ...typeScale.body,
    textAlign: "center",
    paddingVertical: spacing.lg,
  },
});

// src/features/dashboard/components/DashboardScreen.tsx
/**
 * Dashboard: top bar with the brand and AI settings, a page intro, and a bento grid of areas. The
 * first area is featured. Each area opens its own hub menu of apps.
 */
import { ScrollView, StyleSheet, Text, View, Pressable } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { LayoutGrid, Settings } from "lucide-react-native";
import { pointerCursor } from "@/components/tool/FormControls";
import { contentWidth, shape, spacing, touchTarget, typeScale, useLayout, useThemeColors, type LayoutSize } from "@/theme";
import { HUBS } from "../data/apps";
import { HubCard } from "./HubCard";

const STANDARD_WIDTH: Record<LayoutSize, `${number}%`> = {
  phone: "100%",
  tablet: "48.5%",
  desktop: "32%",
};

const FEATURED_WIDTH: Record<LayoutSize, `${number}%`> = {
  phone: "100%",
  tablet: "100%",
  desktop: "66%",
};

export function DashboardScreen() {
  const colors = useThemeColors();
  const router = useRouter();
  const { size } = useLayout();

  return (
    <SafeAreaView style={[styles.screen, { backgroundColor: colors.background }]} edges={["top", "left", "right"]}>
      <View style={[styles.topBar, { borderBottomColor: colors.border }]}>
        <Text style={styles.brand}>
          <Text style={{ color: colors.primary }}>AI</Text>
          <Text style={{ color: colors.foreground }}>Trainer</Text>
        </Text>
        <Pressable
          onPress={() => router.push("/admin/settings")}
          accessibilityRole="button"
          accessibilityLabel="Open AI settings"
          style={({ pressed }) => [styles.iconButton, pointerCursor, pressed && { backgroundColor: colors.muted }]}
        >
          <Settings size={22} color={colors.foreground} />
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.page}>
          <View style={styles.intro}>
            <Text accessibilityRole="header" style={[styles.title, { color: colors.foreground }]}>
              Dashboard
            </Text>
            <Text style={[styles.subtitle, { color: colors.mutedForeground }]}>
              Pick an area to start. Each one opens its own tools.
            </Text>
          </View>

          {HUBS.length === 0 ? (
            <View style={styles.empty}>
              <LayoutGrid size={48} color={colors.mutedForeground} />
              <Text style={[styles.emptyTitle, { color: colors.foreground }]}>No areas yet</Text>
              <Text style={[styles.subtitle, { color: colors.mutedForeground }]}>Areas will appear here once they are added.</Text>
            </View>
          ) : (
            <View style={styles.grid}>
              {HUBS.map((hub, index) => {
                const featured = index === 0 && size !== "phone";
                return (
                  <HubCard
                    key={hub.key}
                    hub={hub}
                    featured={featured}
                    width={featured ? FEATURED_WIDTH[size] : STANDARD_WIDTH[size]}
                    onPress={() => router.push(hub.route as never)}
                  />
                );
              })}
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  topBar: {
    height: 64,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.lg,
    borderBottomWidth: 1,
  },
  brand: {
    ...typeScale.title,
    fontWeight: "700",
  },
  iconButton: {
    width: touchTarget,
    height: touchTarget,
    borderRadius: shape.full,
    alignItems: "center",
    justifyContent: "center",
  },
  content: {
    padding: spacing.lg,
    paddingBottom: spacing["2xl"],
  },
  page: {
    width: "100%",
    maxWidth: contentWidth.dashboard,
    alignSelf: "center",
    gap: spacing["2xl"],
  },
  intro: {
    gap: spacing.sm,
  },
  title: {
    ...typeScale.display,
  },
  subtitle: {
    ...typeScale.body,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    rowGap: spacing.sm,
  },
  empty: {
    alignItems: "center",
    gap: spacing.sm,
    paddingVertical: spacing["2xl"],
  },
  emptyTitle: {
    ...typeScale.title,
  },
});

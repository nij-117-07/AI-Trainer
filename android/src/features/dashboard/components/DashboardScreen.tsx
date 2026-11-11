// src/features/dashboard/components/DashboardScreen.tsx
/**
 * Dashboard: header bar, page intro, and the area list. Each area opens its own hub menu of apps.
 * Mirrors the webui dashboard (webui/src/app/(authenticated)/dashboard/page.tsx).
 */
import { ScrollView, StyleSheet, Text, View, Pressable } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { ChevronRight, Settings } from "lucide-react-native";
import { CardGrid } from "@/components/tool/CardGrid";
import { pointerCursor } from "@/components/tool/FormControls";
import { contentWidth, radius, spacing, useThemeColors } from "@/theme";
import { HUBS } from "../data/apps";

export function DashboardScreen() {
  const colors = useThemeColors();
  const router = useRouter();

  return (
    <SafeAreaView style={[styles.screen, { backgroundColor: colors.background }]} edges={["top", "left", "right"]}>
      <View style={[styles.header, { borderBottomColor: colors.border, backgroundColor: colors.background }]}>
        <Text style={styles.brand}>
          <Text style={{ color: colors.primary }}>AI</Text>
          <Text style={{ color: colors.foreground }}>Trainer</Text>
        </Text>
        <Pressable
          onPress={() => router.push("/admin/settings")}
          accessibilityRole="button"
          accessibilityLabel="Open AI settings"
          style={({ pressed }) => [
            styles.iconButton,
            pointerCursor,
            { borderColor: colors.border },
            pressed && { backgroundColor: colors.muted },
          ]}
        >
          <Settings size={18} color={colors.foreground} />
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
            <Text style={[styles.empty, { color: colors.mutedForeground }]}>No areas are available yet.</Text>
          ) : (
            <CardGrid>
              {HUBS.map((hub) => {
                const Icon = hub.icon;
                const tone = colors.tone[hub.tone];
                return (
                  <Pressable
                    key={hub.key}
                    onPress={() => router.push(hub.route as never)}
                    accessibilityRole="button"
                    accessibilityLabel={`Open ${hub.title}`}
                    accessibilityHint={hub.description}
                    style={({ pressed }) => [
                      styles.hubCard,
                      pointerCursor,
                      { backgroundColor: colors.card, borderColor: colors.border },
                      pressed && { backgroundColor: colors.muted },
                    ]}
                  >
                    <View style={[styles.hubIcon, { backgroundColor: tone.bg, borderColor: tone.border }]}>
                      <Icon size={24} color={tone.fg} />
                    </View>
                    <View style={styles.hubBody}>
                      <Text style={[styles.hubTitle, { color: colors.foreground }]}>{hub.title}</Text>
                      <Text style={[styles.hubText, { color: colors.mutedForeground }]} numberOfLines={2}>
                        {hub.description}
                      </Text>
                    </View>
                    <ChevronRight size={20} color={colors.mutedForeground} />
                  </Pressable>
                );
              })}
            </CardGrid>
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
  header: {
    height: 64,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.lg,
    borderBottomWidth: 1,
  },
  brand: {
    fontSize: 20,
    fontWeight: "700",
    letterSpacing: -0.3,
  },
  iconButton: {
    width: 44,
    height: 44,
    borderRadius: radius.full,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  content: {
    padding: spacing.lg,
    paddingBottom: spacing["2xl"],
  },
  page: {
    width: "100%",
    maxWidth: contentWidth.wide,
    alignSelf: "center",
    gap: spacing.xl,
  },
  intro: {
    gap: spacing.xs,
  },
  title: {
    fontSize: 26,
    fontWeight: "700",
    letterSpacing: -0.4,
  },
  subtitle: {
    fontSize: 15,
    lineHeight: 22,
  },
  hubCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.lg,
    minHeight: 44,
    borderWidth: 1,
    borderRadius: radius["2xl"],
    padding: spacing.xl,
  },
  hubIcon: {
    width: 48,
    height: 48,
    borderRadius: radius.lg,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  hubBody: {
    flex: 1,
    gap: spacing.xs,
  },
  hubTitle: {
    fontSize: 18,
    fontWeight: "600",
  },
  hubText: {
    fontSize: 14,
    lineHeight: 21,
  },
  empty: {
    fontSize: 14,
    textAlign: "center",
    paddingVertical: spacing.lg,
  },
});

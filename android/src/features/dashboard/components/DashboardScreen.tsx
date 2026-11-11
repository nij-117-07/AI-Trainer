// src/features/dashboard/components/DashboardScreen.tsx
/**
 * Dashboard: header bar and the area list. Each area opens its own hub menu of apps.
 * Mirrors the webui dashboard (webui/src/app/(authenticated)/dashboard/page.tsx).
 */
import { ScrollView, StyleSheet, Text, View, Pressable } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { ChevronRight, Settings } from "lucide-react-native";
import { contentWidth, radius, spacing, useLayout, useThemeColors } from "@/theme";
import { HUBS } from "../data/apps";

export function DashboardScreen() {
  const colors = useThemeColors();
  const router = useRouter();
  const { isTablet } = useLayout();

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
            { borderColor: colors.border },
            pressed && { backgroundColor: colors.muted },
          ]}
        >
          <Settings size={18} color={colors.foreground} />
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={[styles.section, { maxWidth: contentWidth.wide }]} accessibilityLabel="Areas">
          {HUBS.map((hub) => {
            const Icon = hub.icon;
            const tone = colors.tone[hub.tone];
            return (
              <Pressable
                key={hub.key}
                onPress={() => router.push(hub.route as never)}
                accessibilityRole="button"
                accessibilityLabel={`Open ${hub.title}`}
                style={({ pressed }) => [
                  styles.appCard,
                  { width: isTablet ? "48.5%" : "100%", backgroundColor: colors.card, borderColor: colors.border },
                  pressed && { backgroundColor: colors.muted },
                ]}
              >
                <View style={[styles.appIcon, { backgroundColor: tone.bg, borderColor: tone.border }]}>
                  <Icon size={20} color={tone.fg} />
                </View>
                <View style={styles.appBody}>
                  <Text style={[styles.appTitle, { color: colors.foreground }]}>{hub.title}</Text>
                  <Text style={[styles.appText, { color: colors.mutedForeground }]}>{hub.description}</Text>
                </View>
                <ChevronRight size={20} color={colors.mutedForeground} />
              </Pressable>
            );
          })}
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
    width: 40,
    height: 40,
    borderRadius: radius.full,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  content: {
    padding: spacing.lg,
    paddingBottom: spacing["2xl"],
    gap: spacing["2xl"],
  },
  section: {
    width: "100%",
    alignSelf: "center",
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    gap: spacing.lg,
  },
  appCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.lg,
    borderWidth: 1,
    borderRadius: radius["2xl"],
    padding: spacing.xl,
  },
  appIcon: {
    width: 44,
    height: 44,
    borderRadius: radius.lg,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  appBody: {
    flex: 1,
    gap: spacing.xs,
  },
  appTitle: {
    fontSize: 18,
    fontWeight: "600",
  },
  appText: {
    fontSize: 14,
    lineHeight: 21,
  },
});

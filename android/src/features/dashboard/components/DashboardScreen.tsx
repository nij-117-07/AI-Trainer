// src/features/dashboard/components/DashboardScreen.tsx
/**
 * Dashboard starter: header bar, welcome card, and hub grid. Mirrors the webui dashboard
 * (webui/src/app/(authenticated)/dashboard/page.tsx). Hubs are placeholders until their pages are added.
 */
import { ScrollView, StyleSheet, Text, View, Pressable, useWindowDimensions } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { ChevronRight, ClipboardList, LayoutGrid, Settings, Sparkles } from "lucide-react-native";
import { breakpoints, radius, spacing, useThemeColors } from "@/theme";
import { HUBS } from "../data/hubs";
import { HubCard } from "./HubCard";

export function DashboardScreen() {
  const colors = useThemeColors();
  const router = useRouter();
  const { width } = useWindowDimensions();
  const hubWidth = width >= breakpoints.tablet ? "48.5%" : "100%";

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
        <View style={[styles.welcome, { backgroundColor: colors.hero, borderColor: colors.hero }]}>
          <View pointerEvents="none" style={[styles.glow, styles.glowTop, { backgroundColor: colors.heroForeground }]} />
          <View pointerEvents="none" style={[styles.glow, styles.glowBottom, { backgroundColor: colors.heroForeground }]} />
          <View style={styles.eyebrow}>
            <Sparkles size={16} color={colors.heroForeground} />
            <Text style={[styles.eyebrowText, { color: colors.heroForeground }]}>Welcome back</Text>
          </View>
          <Text style={[styles.welcomeTitle, { color: colors.heroForeground }]}>What are we learning today?</Text>
          <Text style={[styles.welcomeText, { color: colors.heroForeground, opacity: 0.88 }]}>
            Pick a hub to explore AI-powered tools for learning, practice, language, and productivity.
          </Text>
        </View>

        <View style={styles.section} accessibilityLabel="Application Hubs">
          <View style={styles.sectionHeader}>
            <LayoutGrid size={20} color={colors.mutedForeground} />
            <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Explore hubs</Text>
          </View>
          <View style={styles.grid}>
            {HUBS.map((hub) => (
              <HubCard key={hub.key} hub={hub} width={hubWidth} />
            ))}
          </View>
        </View>

        <View style={styles.section} accessibilityLabel="Applications">
          <View style={styles.sectionHeader}>
            <ClipboardList size={20} color={colors.mutedForeground} />
            <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Applications</Text>
          </View>
          <Pressable
            onPress={() => router.push("/practice/testing-portal")}
            accessibilityRole="button"
            accessibilityLabel="Open Testing Portal"
            style={({ pressed }) => [
              styles.appCard,
              { backgroundColor: colors.card, borderColor: colors.border },
              pressed && { backgroundColor: colors.muted },
            ]}
          >
            <View style={[styles.appIcon, { backgroundColor: colors.tone.rose.bg, borderColor: colors.tone.rose.border }]}>
              <ClipboardList size={20} color={colors.tone.rose.fg} />
            </View>
            <View style={styles.appBody}>
              <Text style={[styles.appTitle, { color: colors.foreground }]}>Testing Portal</Text>
              <Text style={[styles.appText, { color: colors.mutedForeground }]}>
                Generate MCQs and theoretical questions, write expert answers, and solve MCQs with your AI model.
              </Text>
            </View>
            <ChevronRight size={20} color={colors.mutedForeground} />
          </Pressable>
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
  welcome: {
    borderWidth: 1,
    borderRadius: radius["2xl"],
    padding: spacing.xl,
    paddingVertical: 40,
    overflow: "hidden",
    gap: spacing.sm,
  },
  glow: {
    position: "absolute",
    width: 220,
    height: 220,
    borderRadius: 110,
    opacity: 0.14,
  },
  glowTop: {
    top: -90,
    right: -90,
  },
  glowBottom: {
    bottom: -110,
    left: -60,
    opacity: 0.09,
  },
  eyebrow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  eyebrowText: {
    fontSize: 14,
    fontWeight: "500",
  },
  welcomeTitle: {
    marginTop: spacing.sm,
    fontSize: 30,
    fontWeight: "700",
    letterSpacing: -0.5,
    lineHeight: 36,
  },
  welcomeText: {
    marginTop: spacing.sm,
    fontSize: 15,
    lineHeight: 23,
  },
  section: {
    gap: spacing.lg,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
  },
  grid: {
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

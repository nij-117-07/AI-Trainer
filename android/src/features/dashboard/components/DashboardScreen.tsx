// src/features/dashboard/components/DashboardScreen.tsx
/**
 * Dashboard: header bar and the applications list. Mirrors the webui dashboard
 * (webui/src/app/(authenticated)/dashboard/page.tsx).
 */
import { ScrollView, StyleSheet, Text, View, Pressable } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { ChevronRight, ClipboardList, GraduationCap, Settings, type LucideIcon } from "lucide-react-native";
import { radius, spacing, useThemeColors, type Tone } from "@/theme";

interface AppCard {
  key: string;
  title: string;
  description: string;
  route: string;
  icon: LucideIcon;
  tone: Tone;
}

const APPS: AppCard[] = [
  {
    key: "testing-portal",
    title: "Testing Portal",
    description: "Generate MCQs and theoretical questions, write expert answers, and solve MCQs with your AI model.",
    route: "/practice/testing-portal",
    icon: ClipboardList,
    tone: "rose",
  },
  {
    key: "explainer",
    title: "Explainer Tools",
    description: "Explain topics, write A-to-Z tutorials and roadmaps, simplify ideas, and plan your learning.",
    route: "/learning/explainer",
    icon: GraduationCap,
    tone: "sky",
  },
];

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
            { borderColor: colors.border },
            pressed && { backgroundColor: colors.muted },
          ]}
        >
          <Settings size={18} color={colors.foreground} />
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.section} accessibilityLabel="Applications">
          <View style={styles.sectionHeader}>
            <ClipboardList size={20} color={colors.mutedForeground} />
            <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Applications</Text>
          </View>
          {APPS.map((app) => {
            const Icon = app.icon;
            const tone = colors.tone[app.tone];
            return (
              <Pressable
                key={app.key}
                onPress={() => router.push(app.route as never)}
                accessibilityRole="button"
                accessibilityLabel={`Open ${app.title}`}
                style={({ pressed }) => [
                  styles.appCard,
                  { backgroundColor: colors.card, borderColor: colors.border },
                  pressed && { backgroundColor: colors.muted },
                ]}
              >
                <View style={[styles.appIcon, { backgroundColor: tone.bg, borderColor: tone.border }]}>
                  <Icon size={20} color={tone.fg} />
                </View>
                <View style={styles.appBody}>
                  <Text style={[styles.appTitle, { color: colors.foreground }]}>{app.title}</Text>
                  <Text style={[styles.appText, { color: colors.mutedForeground }]}>{app.description}</Text>
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

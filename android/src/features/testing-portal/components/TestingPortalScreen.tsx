// src/features/testing-portal/components/TestingPortalScreen.tsx
/**
 * Testing Portal: four tabs for generating MCQs and theoretical questions, writing expert
 * answers, and solving MCQs. Every tab stays mounted and is only hidden, so drafts and
 * results survive switching tabs. Text fields keep the keyboard from covering the input.
 */
import { useState } from "react";
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { ArrowLeft } from "lucide-react-native";
import { radius, spacing, useThemeColors } from "@/theme";
import { useAiSettings } from "@/features/ai-settings/providers/AiSettingsProvider";
import { isAiConfigured } from "../lib/llm";
import { ActionButton, ChoiceChips, Panel } from "./FormControls";
import { AnswerTab } from "./AnswerTab";
import { McqTab } from "./McqTab";
import { SolverTab } from "./SolverTab";
import { TheoreticalTab } from "./TheoreticalTab";

type TabKey = "mcq" | "theoretical" | "answer" | "solver";

const TABS: { value: TabKey; label: string }[] = [
  { value: "mcq", label: "MCQs" },
  { value: "theoretical", label: "Theoretical" },
  { value: "answer", label: "Expert answer" },
  { value: "solver", label: "Solve an MCQ" },
];

function tabVisibility(visible: boolean) {
  return { display: visible ? ("flex" as const) : ("none" as const) };
}

export function TestingPortalScreen() {
  const colors = useThemeColors();
  const router = useRouter();
  const { settings, loaded } = useAiSettings();
  const [tab, setTab] = useState<TabKey>("mcq");
  const configured = isAiConfigured(settings);

  return (
    <SafeAreaView style={[styles.screen, { backgroundColor: colors.background }]} edges={["top", "left", "right"]}>
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <Pressable
          onPress={() => router.back()}
          accessibilityRole="button"
          accessibilityLabel="Go back"
          style={({ pressed }) => [styles.iconButton, { borderColor: colors.border }, pressed && { backgroundColor: colors.muted }]}
        >
          <ArrowLeft size={18} color={colors.foreground} />
        </Pressable>
        <Text style={[styles.headerTitle, { color: colors.foreground }]}>Testing Portal</Text>
        <View style={styles.iconSpacer} />
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tabScroll} contentContainerStyle={styles.tabBar}>
        <ChoiceChips options={TABS} value={tab} onChange={setTab} wrap={false} />
      </ScrollView>

      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === "ios" ? "padding" : undefined}>
        <ScrollView
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
        >
          {loaded && !configured && (
            <Panel>
              <Text style={[styles.noticeTitle, { color: colors.foreground }]}>AI model not configured</Text>
              <Text style={[styles.noticeText, { color: colors.mutedForeground }]}>
                Add a model name and API key in AI settings before generating content.
              </Text>
              <ActionButton
                label="Open AI settings"
                variant="outline"
                onPress={() => router.push("/admin/settings")}
              />
            </Panel>
          )}

          <View style={tabVisibility(tab === "mcq")}>
            <McqTab />
          </View>
          <View style={tabVisibility(tab === "theoretical")}>
            <TheoreticalTab />
          </View>
          <View style={tabVisibility(tab === "answer")}>
            <AnswerTab />
          </View>
          <View style={tabVisibility(tab === "solver")}>
            <SolverTab />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  flex: {
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
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: radius.full,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  iconSpacer: {
    width: 40,
  },
  tabScroll: {
    flexGrow: 0,
  },
  tabBar: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  content: {
    padding: spacing.lg,
    paddingBottom: spacing["2xl"],
    gap: spacing.lg,
  },
  noticeTitle: {
    fontSize: 16,
    fontWeight: "600",
  },
  noticeText: {
    fontSize: 14,
    lineHeight: 21,
  },
});

// src/features/joke-coach/components/JokeCoachTool.tsx
/**
 * Joke Coach body: a mode switcher. Every mode stays mounted, so a request still running in one
 * mode keeps going and its result is saved when you switch back.
 */
import { useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { useThemeColors, spacing } from "@/theme";
import { ChoiceChips } from "@/components/tool/FormControls";
import { Section } from "@/components/tool/Section";
import { JOKE_MODE_OPTIONS } from "../options";
import type { JokeMode } from "../types";
import { JokeLabTab } from "./JokeLabTab";
import { ClassifyTab } from "./ClassifyTab";
import { PracticeTab } from "./PracticeTab";
import { CrowdTab } from "./CrowdTab";

export function JokeCoachTool() {
  const colors = useThemeColors();
  const [mode, setMode] = useState<JokeMode>("lab");

  return (
    <Section>
      <Text style={[styles.intro, { color: colors.mutedForeground }]}>
        Get a scenario in your language, write a joke for it, and keep resubmitting until the coach is happy. Then
        ask for a fresh joke or an improved version. Classify, drill, and crowd tools sit alongside.
      </Text>
      <ChoiceChips options={JOKE_MODE_OPTIONS} value={mode} onChange={setMode} />

      <View style={{ display: mode === "lab" ? "flex" : "none" }}>
        <JokeLabTab />
      </View>
      <View style={{ display: mode === "classify" ? "flex" : "none" }}>
        <ClassifyTab />
      </View>
      <View style={{ display: mode === "practice" ? "flex" : "none" }}>
        <PracticeTab />
      </View>
      <View style={{ display: mode === "crowd" ? "flex" : "none" }}>
        <CrowdTab />
      </View>
    </Section>
  );
}

const styles = StyleSheet.create({
  intro: {
    fontSize: 14,
    lineHeight: 21,
    marginBottom: spacing.xs,
  },
});

// src/features/joke-coach/components/JokeCoachTool.tsx
/**
 * Joke Coach body: a mode switcher over six tools. Every mode stays mounted, so a request still
 * running in one mode keeps going and its result is saved when you switch back.
 */
import { useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { useThemeColors, spacing } from "@/theme";
import { ChoiceChips } from "@/components/tool/FormControls";
import { Section } from "@/components/tool/Section";
import { JOKE_MODE_OPTIONS } from "../options";
import type { JokeMode } from "../types";
import { GenerateTab } from "./GenerateTab";
import { EvaluateTab } from "./EvaluateTab";
import { RewriteTab } from "./RewriteTab";
import { ClassifyTab } from "./ClassifyTab";
import { PracticeTab } from "./PracticeTab";
import { CrowdTab } from "./CrowdTab";

export function JokeCoachTool() {
  const colors = useThemeColors();
  const [mode, setMode] = useState<JokeMode>("generate");

  return (
    <Section>
      <Text style={[styles.intro, { color: colors.mutedForeground }]}>
        Generate original jokes, get structured feedback, sharpen them for a goal, classify how they work, drill
        with a coach, and simulate the crowd before you step on stage.
      </Text>
      <ChoiceChips options={JOKE_MODE_OPTIONS} value={mode} onChange={setMode} />

      <View style={{ display: mode === "generate" ? "flex" : "none" }}>
        <GenerateTab />
      </View>
      <View style={{ display: mode === "evaluate" ? "flex" : "none" }}>
        <EvaluateTab />
      </View>
      <View style={{ display: mode === "rewrite" ? "flex" : "none" }}>
        <RewriteTab />
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

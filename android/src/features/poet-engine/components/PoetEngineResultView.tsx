// src/features/poet-engine/components/PoetEngineResultView.tsx
/** Renders one Poet Engine explanation as a stack of callouts: etymology, poem, translation, reflection, and metaphor. */
import { StyleSheet, Text } from "react-native";
import { BookA, Eye, Languages, Lightbulb, Quote } from "lucide-react-native";
import { spacing, useThemeColors } from "@/theme";
import { ListenButton } from "@/components/tool/ListenButton";
import { MarkdownText } from "@/components/tool/MarkdownText";
import { ResultCallout } from "@/components/tool/ResultCallout";
import type { ConceptResult } from "../types";

function quote(text: string): string {
  return text
    .split("\n")
    .map((line) => `> ${line}`)
    .join("\n");
}

export function PoetEngineResultView({ result }: { result: ConceptResult }) {
  const colors = useThemeColors();
  const sections = [
    { key: "etymology", title: "Etymological Soul", icon: BookA, tone: "amber" as const, body: result.etymologicalSoul, quoted: false },
    { key: "poetry", title: "Original Poetry", icon: Quote, tone: "rose" as const, body: result.originalPoetry, quoted: true },
    { key: "translation", title: "Soulful Translation", icon: Languages, tone: "sky" as const, body: result.soulfulTranslation, quoted: false },
    { key: "reflection", title: "Philosophical Reflection", icon: Lightbulb, tone: "emerald" as const, body: result.philosophicalReflection, quoted: false },
    { key: "metaphor", title: "Visual Metaphor", icon: Eye, tone: "sky" as const, body: result.visualMetaphor, quoted: false },
  ].filter((section) => section.body !== "");

  if (sections.length === 0) {
    return <Text style={[styles.empty, { color: colors.mutedForeground }]}>No explanation was returned.</Text>;
  }

  return (
    <>
      {sections.map((section) => (
        <ResultCallout key={section.key} icon={section.icon} title={section.title} tone={section.tone}>
          <MarkdownText content={section.quoted ? quote(section.body) : section.body} />
          <ListenButton text={section.body} label={section.title} />
        </ResultCallout>
      ))}
    </>
  );
}

const styles = StyleSheet.create({
  empty: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: spacing.sm,
  },
});

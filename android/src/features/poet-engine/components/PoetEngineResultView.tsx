// src/features/poet-engine/components/PoetEngineResultView.tsx
/**
 * Renders one Poet Engine explanation. The poem leads as a full-width verse with copy and listen
 * actions; the other explanations follow as cards that stack on a phone and fill columns on tablet
 * and desktop.
 */
import { StyleSheet, Text, View } from "react-native";
import { BookA, Eye, Languages, Lightbulb, Quote } from "lucide-react-native";
import { spacing, useThemeColors } from "@/theme";
import { CardGrid } from "@/components/tool/CardGrid";
import { CopyButton } from "@/components/tool/CopyButton";
import { ListenButton } from "@/components/tool/ListenButton";
import { MarkdownText } from "@/components/tool/MarkdownText";
import { ResultCallout } from "@/components/tool/ResultCallout";
import type { ConceptResult } from "../types";

export function PoetEngineResultView({ result }: { result: ConceptResult }) {
  const colors = useThemeColors();
  const poem = result.originalPoetry;
  const sections = [
    { key: "etymology", title: "Etymological Soul", icon: BookA, tone: "amber" as const, body: result.etymologicalSoul },
    { key: "translation", title: "Soulful Translation", icon: Languages, tone: "sky" as const, body: result.soulfulTranslation },
    { key: "reflection", title: "Philosophical Reflection", icon: Lightbulb, tone: "emerald" as const, body: result.philosophicalReflection },
    { key: "metaphor", title: "Visual Metaphor", icon: Eye, tone: "sky" as const, body: result.visualMetaphor },
  ].filter((section) => section.body !== "");

  if (poem === "" && sections.length === 0) {
    return <Text style={[styles.empty, { color: colors.mutedForeground }]}>No explanation was returned.</Text>;
  }

  return (
    <>
      {poem !== "" && (
        <ResultCallout icon={Quote} title="Original Poetry" tone="rose">
          <View style={styles.verse}>
            {poem.split("\n").map((line, index) =>
              line.trim() === "" ? (
                <View key={index} style={styles.stanzaBreak} />
              ) : (
                <Text key={index} selectable style={[styles.line, { color: colors.foreground }]}>
                  {line}
                </Text>
              ),
            )}
          </View>
          <View style={styles.actions}>
            <CopyButton text={poem} label="Copy poem" />
            <ListenButton text={poem} label="Original Poetry" />
          </View>
        </ResultCallout>
      )}

      {sections.length > 0 && (
        <CardGrid>
          {sections.map((section) => (
            <ResultCallout key={section.key} icon={section.icon} title={section.title} tone={section.tone}>
              <MarkdownText content={section.body} />
              <ListenButton text={section.body} label={section.title} />
            </ResultCallout>
          ))}
        </CardGrid>
      )}
    </>
  );
}

const styles = StyleSheet.create({
  empty: {
    fontSize: 14,
    lineHeight: 20,
  },
  verse: {
    maxWidth: 560,
    paddingVertical: spacing.xs,
  },
  line: {
    fontSize: 18,
    lineHeight: 30,
  },
  stanzaBreak: {
    height: spacing.lg,
  },
  actions: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
    gap: spacing.sm,
  },
});

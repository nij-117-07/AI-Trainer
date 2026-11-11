// src/features/poet-engine/components/PoetEngineResultView.tsx
/**
 * Renders one Poet Engine explanation. The poem leads as lines kept as written, with copy and listen
 * icons. The translation and the notes sit under one disclosure, summarised by the first line of the
 * translation.
 */
import { StyleSheet, Text, View } from "react-native";
import { BookA, Eye, Languages, Lightbulb } from "lucide-react-native";
import { spacing, typeScale, useThemeColors } from "@/theme";
import { Panel } from "@/components/tool/FormControls";
import { CopyButton } from "@/components/tool/CopyButton";
import { Disclosure } from "@/components/tool/Disclosure";
import { ListenButton } from "@/components/tool/ListenButton";
import { MarkdownText } from "@/components/tool/MarkdownText";
import type { ConceptResult } from "../types";

export function PoetEngineResultView({ result }: { result: ConceptResult }) {
  const colors = useThemeColors();
  const poem = result.originalPoetry;
  const sections = [
    { key: "translation", title: "Soulful translation", icon: Languages, tone: "sky" as const, body: result.soulfulTranslation },
    { key: "etymology", title: "Etymological soul", icon: BookA, tone: "amber" as const, body: result.etymologicalSoul },
    { key: "reflection", title: "Philosophical reflection", icon: Lightbulb, tone: "emerald" as const, body: result.philosophicalReflection },
    { key: "metaphor", title: "Visual metaphor", icon: Eye, tone: "sky" as const, body: result.visualMetaphor },
  ].filter((section) => section.body !== "");

  if (poem === "" && sections.length === 0) {
    return <Text style={[styles.empty, { color: colors.mutedForeground }]}>No explanation was returned.</Text>;
  }

  return (
    <>
      {poem !== "" && (
        <Panel>
          <View>
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
            <ListenButton text={poem} label="poem" />
          </View>
        </Panel>
      )}

      {sections.length > 0 && (
        <Disclosure title="Translation and notes" summary={firstLine(sections[0].body)}>
          {sections.map((section) => {
            const Icon = section.icon;
            return (
              <View key={section.key} style={styles.section}>
                <View style={styles.sectionHeader}>
                  <Icon size={16} color={colors.tone[section.tone].fg} />
                  <Text accessibilityRole="header" style={[styles.sectionTitle, { color: colors.foreground }]}>
                    {section.title}
                  </Text>
                </View>
                <MarkdownText content={section.body} />
                <ListenButton text={section.body} label={section.title} />
              </View>
            );
          })}
        </Disclosure>
      )}
    </>
  );
}

function firstLine(text: string): string {
  return text.split("\n")[0].trim();
}

const styles = StyleSheet.create({
  empty: {
    ...typeScale.body,
  },
  line: {
    ...typeScale.title,
    fontWeight: "400",
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
  section: {
    gap: spacing.sm,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  sectionTitle: {
    ...typeScale.label,
    fontWeight: "600",
  },
});

// src/features/word-of-the-day/components/WordOfTheDayView.tsx
/**
 * Renders today's word: the word as the hero, with its pronunciation and translation, then the
 * meaning in a callout and the origin, usage, example, and synonyms as disclosures. Each disclosure
 * shows a one-line summary when closed. Cards stack on a phone and fill columns on tablet and desktop.
 */
import { StyleSheet, Text, View } from "react-native";
import { BookA, History, MessageCircle, Network, Quote } from "lucide-react-native";
import type { LucideIcon } from "lucide-react-native";
import { spacing, typeScale, useThemeColors } from "@/theme";
import { CardGrid } from "@/components/tool/CardGrid";
import { CopyButton } from "@/components/tool/CopyButton";
import { Disclosure } from "@/components/tool/Disclosure";
import { Panel } from "@/components/tool/FormControls";
import { ListenButton } from "@/components/tool/ListenButton";
import { MarkdownText } from "@/components/tool/MarkdownText";
import { ResultCallout } from "@/components/tool/ResultCallout";
import type { WordOfTheDay } from "../types";

export function WordOfTheDayView({ word }: { word: WordOfTheDay }) {
  const colors = useThemeColors();
  const origin = [word.morphologyBreakdown, word.historicalEvolution].filter((part) => part !== "");

  return (
    <>
      <Panel>
        <View style={styles.hero}>
          <Text accessibilityRole="header" style={[styles.word, { color: colors.foreground }]}>
            {word.chosenWord || "Untitled word"}
          </Text>
          {word.phoneticAndAudioGuide !== "" && (
            <Text style={[styles.caption, { color: colors.mutedForeground }]}>{word.phoneticAndAudioGuide}</Text>
          )}
          {word.nativeTranslation !== "" && (
            <Text style={[styles.translation, { color: colors.foreground }]}>{word.nativeTranslation}</Text>
          )}
        </View>
        <Actions text={word.chosenWord} label="word" />
      </Panel>

      {word.primaryDefinition !== "" && (
        <ResultCallout icon={BookA} title="Meaning" tone="sky">
          <MarkdownText content={word.primaryDefinition} />
          <Actions text={word.primaryDefinition} label="meaning" />
        </ResultCallout>
      )}

      <CardGrid>
        {origin.length > 0 && (
          <Detail icon={History} title="Origin" summary={summaryOf(origin[0])} parts={origin} />
        )}
        {word.theVibeCheck !== "" && (
          <Detail icon={MessageCircle} title="Usage" summary={summaryOf(word.theVibeCheck)} parts={[word.theVibeCheck]} />
        )}
        {word.modernUsageSentence !== "" && (
          <Detail icon={Quote} title="Example" summary={summaryOf(word.modernUsageSentence)} parts={[word.modernUsageSentence]} />
        )}
        {word.synonymWeb.length > 0 && (
          <Detail
            icon={Network}
            title="Synonyms"
            summary={word.synonymWeb.join(", ")}
            parts={[word.synonymWeb.map((synonym) => `- ${synonym}`).join("\n")]}
          />
        )}
      </CardGrid>
    </>
  );
}

function Detail({ icon, title, summary, parts }: { icon: LucideIcon; title: string; summary: string; parts: string[] }) {
  return (
    <Disclosure icon={icon} title={title} summary={summary}>
      {parts.map((part) => (
        <MarkdownText key={part} content={part} />
      ))}
      <Actions text={parts.join("\n\n")} label={title.toLowerCase()} />
    </Disclosure>
  );
}

function Actions({ text, label }: { text: string; label: string }) {
  return (
    <View style={styles.actions}>
      <ListenButton text={text} label={label} />
      <CopyButton text={text} label={`Copy ${label}`} />
    </View>
  );
}

/** Strips Markdown marks and line breaks so a closed disclosure shows the start of its text. */
function summaryOf(text: string): string {
  return text.replace(/[*_`#>]/g, "").replace(/\s+/g, " ").trim();
}

const styles = StyleSheet.create({
  hero: {
    gap: spacing.xs,
  },
  word: {
    ...typeScale.display,
  },
  caption: {
    ...typeScale.caption,
  },
  translation: {
    ...typeScale.body,
    fontStyle: "italic",
  },
  actions: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
});

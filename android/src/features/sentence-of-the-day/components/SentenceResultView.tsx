// src/features/sentence-of-the-day/components/SentenceResultView.tsx
/**
 * Renders today's sentence. The sentence is the hero, with its translation, copy, and listen
 * controls under it. The usage note sits in a callout, and the word-by-word breakdown, grammar, and
 * variations are collapsed under one-line summaries. Cards stack on a phone and fill columns on
 * tablet and desktop.
 */
import { StyleSheet, Text, View } from "react-native";
import { BookOpen, Languages, Lightbulb, Shuffle } from "lucide-react-native";
import { spacing, typeScale, useThemeColors } from "@/theme";
import { CardGrid } from "@/components/tool/CardGrid";
import { CopyButton } from "@/components/tool/CopyButton";
import { Disclosure } from "@/components/tool/Disclosure";
import { Panel } from "@/components/tool/FormControls";
import { ListenButton } from "@/components/tool/ListenButton";
import { MarkdownText } from "@/components/tool/MarkdownText";
import { ResultCallout } from "@/components/tool/ResultCallout";
import { oneLineSummary } from "../lib/text";
import type { SentenceOfTheDay } from "../types";

export function SentenceResultView({ sentence }: { sentence: SentenceOfTheDay }) {
  const colors = useThemeColors();
  const variations = sentence.substitutionOptions.map((option) => `- ${option}`).join("\n");

  return (
    <>
      <Panel>
        <Text accessibilityRole="header" style={[styles.sentence, { color: colors.foreground }]}>
          {sentence.targetSentence || "No sentence returned."}
        </Text>
        {sentence.naturalTranslation !== "" && (
          <Text style={[typeScale.body, { color: colors.mutedForeground }]}>{sentence.naturalTranslation}</Text>
        )}
        <View style={styles.actions}>
          {sentence.targetSentence !== "" && <CopyButton text={sentence.targetSentence} label="Copy sentence" />}
          <ListenButton text={sentence.targetSentence} label="Sentence" />
          {sentence.date !== "" && (
            <Text style={[typeScale.caption, styles.date, { color: colors.mutedForeground }]}>
              Featured on {sentence.date}
            </Text>
          )}
        </View>
      </Panel>

      {sentence.culturalContext !== "" && (
        <ResultCallout icon={Lightbulb} title="Usage note" tone="sky">
          <MarkdownText content={sentence.culturalContext} />
        </ResultCallout>
      )}

      <CardGrid>
        {sentence.literalTranslation !== "" && (
          <Disclosure title="Word for word" icon={Languages} summary={oneLineSummary(sentence.literalTranslation)}>
            <MarkdownText content={sentence.literalTranslation} />
          </Disclosure>
        )}

        {sentence.grammaticalHighlight !== "" && (
          <Disclosure title="Grammar" icon={BookOpen} summary={oneLineSummary(sentence.grammaticalHighlight)}>
            <MarkdownText content={sentence.grammaticalHighlight} />
          </Disclosure>
        )}

        {variations !== "" && (
          <Disclosure
            title="Variations"
            icon={Shuffle}
            summary={oneLineSummary(sentence.substitutionOptions[0])}
          >
            <MarkdownText content={variations} />
          </Disclosure>
        )}
      </CardGrid>
    </>
  );
}

const styles = StyleSheet.create({
  sentence: {
    ...typeScale.headline,
  },
  actions: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
  },
  date: {
    flex: 1,
  },
});

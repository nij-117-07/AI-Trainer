// src/features/sentence-of-the-day/components/SentenceResultView.tsx
/**
 * Renders today's sentence: the sentence and its natural translation as the hero, then the literal
 * translation, grammar, cultural context, and variations. Cards stack on a phone and fill columns
 * on tablet and desktop.
 */
import { StyleSheet, Text } from "react-native";
import { BookOpen, Globe, Quote, Shuffle } from "lucide-react-native";
import { useThemeColors } from "@/theme";
import { CardGrid } from "@/components/tool/CardGrid";
import { Panel } from "@/components/tool/FormControls";
import { ListenButton } from "@/components/tool/ListenButton";
import { MarkdownText } from "@/components/tool/MarkdownText";
import { SectionTitle } from "@/components/tool/SectionTitle";
import type { SentenceOfTheDay } from "../types";

export function SentenceResultView({ sentence }: { sentence: SentenceOfTheDay }) {
  const colors = useThemeColors();
  return (
    <>
      <Panel>
        <SectionTitle icon={Quote} title="Sentence of the day" />
        <Text accessibilityRole="header" style={[styles.sentence, { color: colors.foreground }]}>
          {sentence.targetSentence || "No sentence returned."}
        </Text>
        {sentence.naturalTranslation !== "" && (
          <Text style={[styles.translation, { color: colors.mutedForeground }]}>{sentence.naturalTranslation}</Text>
        )}
        {sentence.literalTranslation !== "" && (
          <MarkdownText content={`**Literal translation:** ${sentence.literalTranslation}`} />
        )}
        <ListenButton text={sentence.targetSentence} label="Sentence" />
        {sentence.date !== "" && (
          <Text style={[styles.note, { color: colors.mutedForeground }]}>Featured on {sentence.date}</Text>
        )}
      </Panel>

      <CardGrid>
        {sentence.grammaticalHighlight !== "" && (
          <Panel>
            <SectionTitle icon={BookOpen} title="Grammatical highlight" />
            <MarkdownText content={sentence.grammaticalHighlight} />
            <ListenButton text={sentence.grammaticalHighlight} label="Grammar" />
          </Panel>
        )}

        {sentence.culturalContext !== "" && (
          <Panel>
            <SectionTitle icon={Globe} title="Cultural context" />
            <MarkdownText content={sentence.culturalContext} />
            <ListenButton text={sentence.culturalContext} label="Cultural context" />
          </Panel>
        )}

        <Panel>
          <SectionTitle icon={Shuffle} title="Try these variations" />
          {sentence.substitutionOptions.length === 0 ? (
            <Text style={[styles.note, { color: colors.mutedForeground }]}>No variations returned.</Text>
          ) : (
            <MarkdownText content={sentence.substitutionOptions.map((option) => `- ${option}`).join("\n")} />
          )}
        </Panel>
      </CardGrid>
    </>
  );
}

const styles = StyleSheet.create({
  sentence: {
    fontSize: 22,
    fontWeight: "700",
    lineHeight: 30,
  },
  translation: {
    fontSize: 16,
    fontStyle: "italic",
    lineHeight: 22,
  },
  note: {
    fontSize: 13,
    lineHeight: 18,
  },
});

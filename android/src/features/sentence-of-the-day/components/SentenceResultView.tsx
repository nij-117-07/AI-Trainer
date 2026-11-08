// src/features/sentence-of-the-day/components/SentenceResultView.tsx
/**
 * Renders the featured sentence: the sentence and its natural translation, the literal
 * translation, grammar, cultural context, and substitution variations.
 */
import { StyleSheet, Text } from "react-native";
import { BookOpen, Globe, Quote, Shuffle } from "lucide-react-native";
import { useThemeColors } from "@/theme";
import { Panel } from "@/components/tool/FormControls";
import { MarkdownText } from "@/components/tool/MarkdownText";
import { SectionTitle } from "@/components/tool/SectionTitle";
import type { SentenceOfTheDay } from "../types";

export function SentenceResultView({ sentence }: { sentence: SentenceOfTheDay }) {
  const colors = useThemeColors();
  return (
    <>
      <Panel>
        <SectionTitle icon={Quote} title="Sentence of the day" />
        <Text style={[styles.sentence, { color: colors.foreground }]}>{sentence.targetSentence || "No sentence returned."}</Text>
        {sentence.naturalTranslation !== "" && (
          <Text style={[styles.translation, { color: colors.mutedForeground }]}>{sentence.naturalTranslation}</Text>
        )}
        {sentence.literalTranslation !== "" && (
          <MarkdownText content={`**Literal translation:** ${sentence.literalTranslation}`} />
        )}
      </Panel>

      {sentence.grammaticalHighlight !== "" && (
        <Panel>
          <SectionTitle icon={BookOpen} title="Grammatical highlight" />
          <MarkdownText content={sentence.grammaticalHighlight} />
        </Panel>
      )}

      {sentence.culturalContext !== "" && (
        <Panel>
          <SectionTitle icon={Globe} title="Cultural context" />
          <MarkdownText content={sentence.culturalContext} />
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

      {sentence.date !== "" && (
        <Text style={[styles.note, { color: colors.mutedForeground }]}>Featured on {sentence.date}</Text>
      )}
    </>
  );
}

const styles = StyleSheet.create({
  sentence: {
    fontSize: 20,
    fontWeight: "700",
    lineHeight: 28,
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

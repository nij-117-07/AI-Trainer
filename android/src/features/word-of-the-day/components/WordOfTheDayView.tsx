// src/features/word-of-the-day/components/WordOfTheDayView.tsx
/**
 * Renders today's Word of the Day: the word and its translation as the hero, then the details as
 * cards. Cards stack on a phone and fill columns on tablet and desktop.
 */
import { StyleSheet, Text } from "react-native";
import { BookA, History, Layers, MessageCircle, Network, Sparkles, Volume2 } from "lucide-react-native";
import type { LucideIcon } from "lucide-react-native";
import { useThemeColors } from "@/theme";
import { CardGrid } from "@/components/tool/CardGrid";
import { Panel } from "@/components/tool/FormControls";
import { ListenButton } from "@/components/tool/ListenButton";
import { MarkdownText } from "@/components/tool/MarkdownText";
import { SectionTitle } from "@/components/tool/SectionTitle";
import type { WordOfTheDay } from "../types";

export function WordOfTheDayView({ word }: { word: WordOfTheDay }) {
  const colors = useThemeColors();
  const details = [
    { icon: Volume2, title: "Phonetic guide", content: word.phoneticAndAudioGuide },
    { icon: Layers, title: "How the word is built", content: word.morphologyBreakdown },
    { icon: BookA, title: "Definition", content: word.primaryDefinition },
    { icon: Sparkles, title: "Vibe check", content: word.theVibeCheck },
    { icon: History, title: "A short history", content: word.historicalEvolution },
    { icon: MessageCircle, title: "In a sentence", content: word.modernUsageSentence },
  ].filter((detail) => detail.content !== "");

  return (
    <>
      <Panel>
        <SectionTitle icon={Sparkles} title="Word of the day" />
        <Text accessibilityRole="header" style={[styles.word, { color: colors.foreground }]}>
          {word.chosenWord || "Untitled word"}
        </Text>
        {word.nativeTranslation !== "" && (
          <Text style={[styles.translation, { color: colors.mutedForeground }]}>{word.nativeTranslation}</Text>
        )}
      </Panel>

      <CardGrid>
        {details.map((detail) => (
          <WordPanel key={detail.title} icon={detail.icon} title={detail.title} content={detail.content} />
        ))}
        <Panel>
          <SectionTitle icon={Network} title="Synonym web" />
          {word.synonymWeb.length === 0 ? (
            <Text style={[styles.empty, { color: colors.mutedForeground }]}>No synonyms returned.</Text>
          ) : (
            <MarkdownText content={word.synonymWeb.map((synonym) => `- ${synonym}`).join("\n")} />
          )}
        </Panel>
      </CardGrid>
    </>
  );
}

function WordPanel({ icon, title, content }: { icon: LucideIcon; title: string; content: string }) {
  return (
    <Panel>
      <SectionTitle icon={icon} title={title} />
      <MarkdownText content={content} />
      <ListenButton text={content} label={title} />
    </Panel>
  );
}

const styles = StyleSheet.create({
  word: {
    fontSize: 28,
    fontWeight: "700",
  },
  translation: {
    fontSize: 16,
    fontStyle: "italic",
  },
  empty: {
    fontSize: 14,
    lineHeight: 20,
  },
});

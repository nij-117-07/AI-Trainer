// src/features/word-of-the-day/components/WordOfTheDayView.tsx
/** Renders one Word of the Day: the word with its translation, then pronunciation, roots, meaning, history, usage, and synonyms. */
import type { ReactNode } from "react";
import { StyleSheet, Text } from "react-native";
import { BookA, History, Layers, MessageCircle, Network, Sparkles, Volume2 } from "lucide-react-native";
import type { LucideIcon } from "lucide-react-native";
import { useThemeColors } from "@/theme";
import { Panel } from "@/components/tool/FormControls";
import { MarkdownText } from "@/components/tool/MarkdownText";
import { SectionTitle } from "@/components/tool/SectionTitle";
import type { WordOfTheDay } from "../types";

export function WordOfTheDayView({ word }: { word: WordOfTheDay }) {
  const colors = useThemeColors();
  return (
    <>
      <Panel>
        <Text style={[styles.word, { color: colors.foreground }]}>{word.chosenWord || "Untitled word"}</Text>
        {word.nativeTranslation !== "" && (
          <Text style={[styles.translation, { color: colors.mutedForeground }]}>{word.nativeTranslation}</Text>
        )}
      </Panel>

      <WordPanel icon={Volume2} title="Phonetic guide" content={word.phoneticAndAudioGuide} />
      <WordPanel icon={Layers} title="How the word is built" content={word.morphologyBreakdown} />
      <WordPanel icon={BookA} title="Definition" content={word.primaryDefinition} />
      <WordPanel icon={Sparkles} title="Vibe check" content={word.theVibeCheck} />
      <WordPanel icon={History} title="A short history" content={word.historicalEvolution} />
      <WordPanel icon={MessageCircle} title="In a sentence" content={word.modernUsageSentence} />

      <Panel>
        <SectionTitle icon={Network} title="Synonym web" />
        {word.synonymWeb.length === 0 ? (
          <Text style={[styles.empty, { color: colors.mutedForeground }]}>No synonyms returned.</Text>
        ) : (
          <MarkdownText content={word.synonymWeb.map((synonym) => `- ${synonym}`).join("\n")} />
        )}
      </Panel>
    </>
  );
}

function WordPanel({ icon, title, content }: { icon: LucideIcon; title: string; content: string }) {
  if (content === "") return null;
  return (
    <Panel>
      <SectionTitle icon={icon} title={title} />
      <MarkdownText content={content} />
    </Panel>
  );
}

const styles = StyleSheet.create({
  word: {
    fontSize: 24,
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

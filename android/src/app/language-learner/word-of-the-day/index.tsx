// src/app/language-learner/word-of-the-day/index.tsx
import { useRouter } from "expo-router";
import { Sparkles } from "lucide-react-native";
import { ActionButton } from "@/components/tool/FormControls";
import { EmptyHint } from "@/components/tool/EmptyHint";
import { Section } from "@/components/tool/Section";
import { ToolScreen } from "@/components/tool/ToolScreen";
import { WordOfTheDayView } from "@/features/word-of-the-day/components/WordOfTheDayView";
import { usePersistedWord } from "@/features/word-of-the-day/hooks/usePersistedDraft";

export default function WordOfTheDayRoute() {
  const router = useRouter();
  const word = usePersistedWord();

  return (
    <ToolScreen
      title="Word of the Day"
      footer={
        <ActionButton
          label="New word"
          icon={Sparkles}
          onPress={() => router.push("/language-learner/word-of-the-day/new")}
        />
      }
    >
      <Section>
        {word ? (
          <WordOfTheDayView word={word} />
        ) : (
          <EmptyHint
            icon={Sparkles}
            title="No word yet"
            hint="Tap New word below, choose a word type and theme, then generate."
          />
        )}
      </Section>
    </ToolScreen>
  );
}

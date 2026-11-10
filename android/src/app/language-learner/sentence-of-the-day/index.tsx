// src/app/language-learner/sentence-of-the-day/index.tsx
import { useRouter } from "expo-router";
import { Quote } from "lucide-react-native";
import { ActionButton } from "@/components/tool/FormControls";
import { EmptyHint } from "@/components/tool/EmptyHint";
import { Section } from "@/components/tool/Section";
import { ToolScreen } from "@/components/tool/ToolScreen";
import { SentenceResultView } from "@/features/sentence-of-the-day/components/SentenceResultView";
import { usePersistedSentence } from "@/features/sentence-of-the-day/hooks/usePersistedDraft";

export default function SentenceOfTheDayRoute() {
  const router = useRouter();
  const sentence = usePersistedSentence();

  return (
    <ToolScreen
      title="Sentence of the Day"
      footer={
        <ActionButton
          label="New sentence"
          icon={Quote}
          onPress={() => router.push("/language-learner/sentence-of-the-day/new")}
        />
      }
    >
      <Section>
        {sentence ? (
          <SentenceResultView sentence={sentence} />
        ) : (
          <EmptyHint
            icon={Quote}
            title="No sentence yet"
            hint="Tap New sentence below, choose a context and complexity level, then generate."
          />
        )}
      </Section>
    </ToolScreen>
  );
}

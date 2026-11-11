// src/app/language-learner/sentence-of-the-day/index.tsx
import { useRouter } from "expo-router";
import { Quote, RefreshCw } from "lucide-react-native";
import { ActionButton, ErrorText } from "@/components/tool/FormControls";
import { EmptyHint } from "@/components/tool/EmptyHint";
import { Section } from "@/components/tool/Section";
import { ToolScreen } from "@/components/tool/ToolScreen";
import { SentenceResultView } from "@/features/sentence-of-the-day/components/SentenceResultView";
import { usePersistedSentence } from "@/features/sentence-of-the-day/hooks/usePersistedDraft";
import { SAVE_FAILED_MESSAGE } from "@/features/sentence-of-the-day/lib/persistence";

export default function SentenceOfTheDayRoute() {
  const router = useRouter();
  const { sentence, saveFailed } = usePersistedSentence();

  return (
    <ToolScreen
      title="Sentence of the Day"
      wide
      footerSide={false}
      footer={
        <ActionButton
          label="New sentence"
          icon={RefreshCw}
          onPress={() => router.push("/language-learner/sentence-of-the-day/new")}
        />
      }
    >
      <Section>
        <ErrorText message={saveFailed ? SAVE_FAILED_MESSAGE : null} />
        {sentence ? (
          <SentenceResultView sentence={sentence} />
        ) : (
          <EmptyHint
            icon={Quote}
            title="No sentence yet"
            hint="Tap New sentence to get one."
          />
        )}
      </Section>
    </ToolScreen>
  );
}

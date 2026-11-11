// src/app/language-learner/sentence-of-the-day/new.tsx
import { useRouter } from "expo-router";
import { Quote } from "lucide-react-native";
import { useLayout } from "@/theme";
import { ActiveLanguageNotice } from "@/features/language-profiles/components/ActiveLanguageNotice";
import { EmptyHint } from "@/components/tool/EmptyHint";
import { ResetButton } from "@/components/tool/ResetButton";
import { Section } from "@/components/tool/Section";
import { ToolScreen } from "@/components/tool/ToolScreen";
import {
  SentenceFormFields,
  SentenceFormFooter,
  SentenceFormSidePanel,
  useSentenceForm,
} from "@/features/sentence-of-the-day/components/SentenceOfTheDayForm";
import { SentenceResultView } from "@/features/sentence-of-the-day/components/SentenceResultView";
import { usePersistedSentence } from "@/features/sentence-of-the-day/hooks/usePersistedDraft";

export default function SentenceOfTheDayNewRoute() {
  const router = useRouter();
  const { size } = useLayout();
  const sentence = useSentenceForm(() => router.back());
  const current = usePersistedSentence();
  const sidePanel = size !== "phone";

  return (
    <ToolScreen
      title="New sentence"
      wide={sidePanel}
      headerRight={<ResetButton onPress={sentence.reset} />}
      footer={sidePanel ? <SentenceFormSidePanel sentence={sentence} /> : <SentenceFormFooter sentence={sentence} />}
    >
      <ActiveLanguageNotice />
      {sidePanel ? (
        <Section>
          {current ? (
            <SentenceResultView sentence={current} />
          ) : (
            <EmptyHint icon={Quote} title="No sentence yet" hint="Fill in the form, then generate a sentence." />
          )}
        </Section>
      ) : (
        <SentenceFormFields sentence={sentence} />
      )}
    </ToolScreen>
  );
}

// src/app/language-learner/sentence-of-the-day/new.tsx
import { useRouter } from "expo-router";
import { Quote } from "lucide-react-native";
import { useLayout } from "@/theme";
import { ActiveLanguageNotice } from "@/features/language-profiles/components/ActiveLanguageNotice";
import { EmptyHint } from "@/components/tool/EmptyHint";
import { ErrorText } from "@/components/tool/FormControls";
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
import { SAVE_FAILED_MESSAGE } from "@/features/sentence-of-the-day/lib/persistence";

export default function SentenceOfTheDayNewRoute() {
  const router = useRouter();
  const { size } = useLayout();
  const sentence = useSentenceForm(() => router.back());
  const { sentence: current, saveFailed } = usePersistedSentence();
  const sidePanel = size !== "phone";

  return (
    <ToolScreen
      title="New sentence"
      wide={sidePanel}
      headerRight={<ResetButton onPress={sentence.reset} accessibilityLabel="Reset form" />}
      footer={sidePanel ? <SentenceFormSidePanel sentence={sentence} /> : <SentenceFormFooter sentence={sentence} />}
    >
      <ActiveLanguageNotice />
      {sidePanel ? (
        <Section>
          <ErrorText message={saveFailed ? SAVE_FAILED_MESSAGE : null} />
          {current ? (
            <SentenceResultView sentence={current} />
          ) : (
            <EmptyHint icon={Quote} title="No sentence yet" hint="Fill in the form, then get a sentence." />
          )}
        </Section>
      ) : (
        <SentenceFormFields sentence={sentence} />
      )}
    </ToolScreen>
  );
}

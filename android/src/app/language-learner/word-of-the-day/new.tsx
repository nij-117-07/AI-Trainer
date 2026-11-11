// src/app/language-learner/word-of-the-day/new.tsx
import { useRouter } from "expo-router";
import { Sparkles } from "lucide-react-native";
import { useLayout } from "@/theme";
import { ActiveLanguageNotice } from "@/features/language-profiles/components/ActiveLanguageNotice";
import { EmptyHint } from "@/components/tool/EmptyHint";
import { ResetButton } from "@/components/tool/ResetButton";
import { Section } from "@/components/tool/Section";
import { ToolScreen } from "@/components/tool/ToolScreen";
import {
  WordOfTheDayFormFields,
  WordOfTheDayFormFooter,
  WordOfTheDayFormSidePanel,
  useWordOfTheDayForm,
} from "@/features/word-of-the-day/components/WordOfTheDayForm";
import { WordOfTheDayView } from "@/features/word-of-the-day/components/WordOfTheDayView";
import { usePersistedWord } from "@/features/word-of-the-day/hooks/usePersistedDraft";

export default function WordOfTheDayNewRoute() {
  const router = useRouter();
  const { size } = useLayout();
  const word = useWordOfTheDayForm(() => router.back());
  const current = usePersistedWord();
  const sidePanel = size !== "phone";

  return (
    <ToolScreen
      title="New word"
      wide={sidePanel}
      headerRight={<ResetButton onPress={word.reset} />}
      footer={sidePanel ? <WordOfTheDayFormSidePanel word={word} /> : <WordOfTheDayFormFooter word={word} />}
    >
      <ActiveLanguageNotice />
      {sidePanel ? (
        <Section>
          {current ? (
            <WordOfTheDayView word={current} />
          ) : (
            <EmptyHint icon={Sparkles} title="No word yet" hint="Fill in the form, then generate a word." />
          )}
        </Section>
      ) : (
        <WordOfTheDayFormFields word={word} />
      )}
    </ToolScreen>
  );
}

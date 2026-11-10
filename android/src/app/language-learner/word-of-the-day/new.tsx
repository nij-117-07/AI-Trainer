// src/app/language-learner/word-of-the-day/new.tsx
import { useRouter } from "expo-router";
import { ActiveLanguageNotice } from "@/features/language-profiles/components/ActiveLanguageNotice";
import { ResetButton } from "@/components/tool/ResetButton";
import { ToolScreen } from "@/components/tool/ToolScreen";
import {
  WordOfTheDayFormFields,
  WordOfTheDayFormFooter,
  useWordOfTheDayForm,
} from "@/features/word-of-the-day/components/WordOfTheDayForm";

export default function WordOfTheDayNewRoute() {
  const router = useRouter();
  const word = useWordOfTheDayForm(() => router.back());

  return (
    <ToolScreen
      title="New word"
      headerRight={<ResetButton onPress={word.reset} />}
      footer={<WordOfTheDayFormFooter word={word} />}
    >
      <ActiveLanguageNotice />
      <WordOfTheDayFormFields word={word} />
    </ToolScreen>
  );
}

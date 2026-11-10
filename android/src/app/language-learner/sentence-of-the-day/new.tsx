// src/app/language-learner/sentence-of-the-day/new.tsx
import { useRouter } from "expo-router";
import { ActiveLanguageNotice } from "@/features/language-profiles/components/ActiveLanguageNotice";
import { ResetButton } from "@/components/tool/ResetButton";
import { ToolScreen } from "@/components/tool/ToolScreen";
import { SentenceFormFields, SentenceFormFooter, useSentenceForm } from "@/features/sentence-of-the-day/components/SentenceOfTheDayForm";

export default function SentenceOfTheDayNewRoute() {
  const router = useRouter();
  const sentence = useSentenceForm(() => router.back());

  return (
    <ToolScreen
      title="New sentence"
      headerRight={<ResetButton onPress={sentence.reset} />}
      footer={<SentenceFormFooter sentence={sentence} />}
    >
      <ActiveLanguageNotice />
      <SentenceFormFields sentence={sentence} />
    </ToolScreen>
  );
}

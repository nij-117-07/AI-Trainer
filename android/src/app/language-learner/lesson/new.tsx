// src/app/language-learner/lesson/new.tsx
import { useRouter } from "expo-router";
import { ActiveLanguageNotice } from "@/features/language-profiles/components/ActiveLanguageNotice";
import { ResetButton } from "@/components/tool/ResetButton";
import { ToolScreen } from "@/components/tool/ToolScreen";
import { LessonFormFields, LessonFormFooter, useLessonForm } from "@/features/lesson/components/LessonForm";

export default function LessonNewRoute() {
  const router = useRouter();
  const lesson = useLessonForm(() => router.back());

  return (
    <ToolScreen
      title="New lesson"
      headerRight={<ResetButton onPress={lesson.reset} />}
      footer={<LessonFormFooter lesson={lesson} />}
    >
      <ActiveLanguageNotice />
      <LessonFormFields lesson={lesson} />
    </ToolScreen>
  );
}

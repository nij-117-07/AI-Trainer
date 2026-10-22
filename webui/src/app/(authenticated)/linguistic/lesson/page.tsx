import { Metadata } from "next";
import { SetPageTitle } from "@/features/navigation/components/SetPageTitle";
import { LessonPage } from "@/features/linguistic/lesson/components/pages/LessonPage";

export const metadata: Metadata = {
  title: "Language Lesson | Linguistic",
  description: "Generate a scaffolded language lesson tuned to your CEFR level and learning focus.",
};

export default function LessonRoutePage() {
  return (
    <>
      <SetPageTitle title="Language Lesson" />
      <LessonPage />
    </>
  );
}

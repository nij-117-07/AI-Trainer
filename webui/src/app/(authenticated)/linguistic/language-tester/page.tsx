import { Metadata } from "next";
import { SetPageTitle } from "@/features/navigation/components/SetPageTitle";
import { LanguageTesterPage } from "@/features/linguistic/language-tester/components/pages/LanguageTesterPage";

export const metadata: Metadata = {
  title: "Language Tester | Linguistic",
  description: "Generate a personalized multiple-choice assessment tuned to your CEFR level and scenario.",
};

export default function LanguageTesterRoutePage() {
  return (
    <>
      <SetPageTitle title="Language Tester" />
      <LanguageTesterPage />
    </>
  );
}

import { Metadata } from "next";
import { SetPageTitle } from "@/features/navigation/components/SetPageTitle";
import { SentenceOfTheDayPage } from "@/features/linguistic/sentence-of-the-day/components/pages/SentenceOfTheDayPage";

export const metadata: Metadata = {
  title: "Sentence of the Day | Linguistic",
  description: "Discover the daily featured sentence in a target language with grammar, culture, and variations.",
};

export default function SentenceOfTheDayRoutePage() {
  return (
    <>
      <SetPageTitle title="Sentence of the Day" />
      <SentenceOfTheDayPage />
    </>
  );
}

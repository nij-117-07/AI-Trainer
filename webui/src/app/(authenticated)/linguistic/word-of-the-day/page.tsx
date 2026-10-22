import { Metadata } from "next";
import { SetPageTitle } from "@/features/navigation/components/SetPageTitle";
import { WordOfTheDayPage } from "@/features/linguistic/word-of-the-day/components/pages/WordOfTheDayPage";

export const metadata: Metadata = {
  title: "Word of the Day | Linguistic",
  description: "Discover a rich word from a target language with pronunciation, morphology, and history.",
};

export default function WordOfTheDayRoutePage() {
  return (
    <>
      <SetPageTitle title="Word of the Day" />
      <WordOfTheDayPage />
    </>
  );
}

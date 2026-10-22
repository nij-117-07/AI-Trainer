import { Metadata } from "next";
import { SetPageTitle } from "@/features/navigation/components/SetPageTitle";
import { TranslationChallengePage } from "@/features/linguistic/language-tester/components/pages/TranslationChallengePage";

export const metadata: Metadata = {
  title: "Translation Challenge | Linguistic",
  description: "Generate an active or passive translation challenge and compare with the reference answer.",
};

export default function TranslationChallengeRoutePage() {
  return (
    <>
      <SetPageTitle title="Translation Challenge" />
      <TranslationChallengePage />
    </>
  );
}

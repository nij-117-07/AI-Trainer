import { Metadata } from "next";
import { SetPageTitle } from "@/features/navigation/components/SetPageTitle";
import { GuessGamePage } from "@/features/practice/guess-game/components/pages/GuessGamePage";

export const metadata: Metadata = {
  title: "Guess Game | Practice",
  description: "Decode a mystery item through clever questions, hints, and coaching.",
};

export default function GuessGameRoutePage() {
  return (
    <>
      <SetPageTitle title="Guess Game" />
      <GuessGamePage />
    </>
  );
}

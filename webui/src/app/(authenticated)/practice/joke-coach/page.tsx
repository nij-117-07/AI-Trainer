import { Metadata } from "next";
import { SetPageTitle } from "@/features/navigation/components/SetPageTitle";
import { JokeCoachPage } from "@/features/practice/joke-coach/components/pages/JokeCoachPage";

export const metadata: Metadata = {
  title: "Joke Coach | Practice",
  description: "Generate, evaluate, rewrite, classify, and drill jokes — and simulate the crowd.",
};

export default function JokeCoachRoutePage() {
  return (
    <>
      <SetPageTitle title="Joke Coach" />
      <JokeCoachPage />
    </>
  );
}

import { Metadata } from "next";
import { SetPageTitle } from "@/features/navigation/components/SetPageTitle";
import { RiddlePage } from "@/features/practice/riddle/components/pages/RiddlePage";

export const metadata: Metadata = {
  title: "Riddle Master | Practice",
  description: "Hone lateral thinking with riddles and get evaluated on how you crack them.",
};

export default function RiddleRoutePage() {
  return (
    <>
      <SetPageTitle title="Riddle Master" />
      <RiddlePage />
    </>
  );
}

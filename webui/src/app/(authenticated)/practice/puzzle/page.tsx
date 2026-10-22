import { Metadata } from "next";
import { SetPageTitle } from "@/features/navigation/components/SetPageTitle";
import { PuzzlePage } from "@/features/practice/puzzle/components/pages/PuzzlePage";

export const metadata: Metadata = {
  title: "Puzzle Solver | Practice",
  description: "Train your logical thinking by cracking puzzles and getting evaluated on your reasoning.",
};

export default function PuzzleRoutePage() {
  return (
    <>
      <SetPageTitle title="Puzzle Solver" />
      <PuzzlePage />
    </>
  );
}

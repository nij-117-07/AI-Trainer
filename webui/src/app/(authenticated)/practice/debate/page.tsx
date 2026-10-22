import { Metadata } from "next";
import { SetPageTitle } from "@/features/navigation/components/SetPageTitle";
import { DebatePage } from "@/features/practice/debate/components/pages/DebatePage";

export const metadata: Metadata = {
  title: "Debate Engine | Practice",
  description: "Build a character-driven persona and go head-to-head, then get a judge's verdict.",
};

export default function DebateRoutePage() {
  return (
    <>
      <SetPageTitle title="Debate Engine" />
      <DebatePage />
    </>
  );
}

import { Metadata } from "next";
import { SetPageTitle } from "@/features/navigation/components/SetPageTitle";
import { PoetEnginePage } from "@/features/linguistic/poet-engine/components/pages/PoetEnginePage";

export const metadata: Metadata = {
  title: "Poet Engine | Linguistic",
  description: "Explain the 'Soul' of a word using AI-driven poetic philology.",
};

export default function PoetEngineRoutePage() {
  return (
    <>
      <SetPageTitle title="Poet Engine" />
      <PoetEnginePage />
    </>
  );
}

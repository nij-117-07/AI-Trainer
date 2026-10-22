import { Metadata } from "next";
import { SetPageTitle } from "@/features/navigation/components/SetPageTitle";
import { PromptGeneratorPage } from "@/features/tools/prompt-generator/components/pages/PromptGeneratorPage";

export const metadata: Metadata = {
  title: "Prompt Generator | Tools",
  description: "Generate or refine a full LLM system persona with a reproducible seed.",
};

export default function PromptGeneratorRoutePage() {
  return (
    <>
      <SetPageTitle title="Prompt Generator" />
      <PromptGeneratorPage />
    </>
  );
}

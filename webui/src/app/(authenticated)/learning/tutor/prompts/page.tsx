import { Metadata } from "next";
import { SetPageTitle } from "@/features/navigation/components/SetPageTitle";
import { PromptManagerPage } from "@/features/learning/tutor/components/pages/PromptManagerPage";

export const metadata: Metadata = {
  title: "Prompt Templates | Learning",
  description: "Manage the tutor persona system prompts stored by the Adaptive Tutor service.",
};

export default function TutorPromptsRoutePage() {
  return (
    <>
      <SetPageTitle title="Prompt Templates" />
      <PromptManagerPage />
    </>
  );
}

import { Metadata } from "next";
import { SetPageTitle } from "@/features/navigation/components/SetPageTitle";
import { SuggestProjectsPage } from "@/features/learning/guides/components/pages/SuggestProjectsPage";

export const metadata: Metadata = {
  title: "Project Suggestions | Learning",
  description: "Generate strategic project use cases for a technology and industry pairing.",
};

export default function SuggestProjectsRoutePage() {
  return (
    <>
      <SetPageTitle title="Project Suggestions" />
      <SuggestProjectsPage />
    </>
  );
}

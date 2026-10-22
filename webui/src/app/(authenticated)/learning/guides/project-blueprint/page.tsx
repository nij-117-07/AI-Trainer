import { Metadata } from "next";
import { SetPageTitle } from "@/features/navigation/components/SetPageTitle";
import { ProjectBlueprintPage } from "@/features/learning/guides/components/pages/ProjectBlueprintPage";

export const metadata: Metadata = {
  title: "Project Blueprint | Learning",
  description: "Generate a unique, industry-specific project blueprint.",
};

export default function ProjectBlueprintRoutePage() {
  return (
    <>
      <SetPageTitle title="Project Blueprint" />
      <ProjectBlueprintPage />
    </>
  );
}

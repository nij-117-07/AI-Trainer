import { Metadata } from "next";
import { SetPageTitle } from "@/features/navigation/components/SetPageTitle";
import { ProjectRecommenderPage } from "@/features/learning/projects/components/pages/ProjectRecommenderPage";

export const metadata: Metadata = {
  title: "Project Recommender | Learning",
  description: "Get practical, hands-on project ideas matched to your topic, scope, and difficulty level.",
};

export default function ProjectRecommenderRoutePage() {
  return (
    <>
      <SetPageTitle title="Project Recommender" />
      <ProjectRecommenderPage />
    </>
  );
}

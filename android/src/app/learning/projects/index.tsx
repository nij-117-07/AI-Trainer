// src/app/learning/projects/index.tsx
import { ProjectRecommenderTab } from "@/features/projects/components/ProjectRecommenderTab";
import { ToolScreen } from "@/components/tool/ToolScreen";

export default function ProjectsRoute() {
  return (
    <ToolScreen title="Project Recommender">
      <ProjectRecommenderTab />
    </ToolScreen>
  );
}

// src/app/learning/projects/index.tsx
import { ResetButton } from "@/components/tool/ResetButton";
import { ToolScreen } from "@/components/tool/ToolScreen";
import { ProjectFooter, ProjectResults } from "@/features/projects/components/ProjectRecommenderTab";
import { useProjectRecommender } from "@/features/projects/hooks/useProjectRecommender";

export default function ProjectsRoute() {
  const recommender = useProjectRecommender();

  return (
    <ToolScreen
      title="Project Recommender"
      headerRight={<ResetButton onPress={recommender.reset} />}
      footer={<ProjectFooter recommender={recommender} />}
    >
      <ProjectResults recommender={recommender} />
    </ToolScreen>
  );
}

// src/app/learning/guides/project-blueprint.tsx
import { ProjectBlueprintTab } from "@/features/guides/components/ProjectBlueprintTab";
import { ToolScreen } from "@/components/tool/ToolScreen";

export default function ProjectBlueprintRoute() {
  return (
    <ToolScreen title="Project Blueprint">
      <ProjectBlueprintTab />
    </ToolScreen>
  );
}

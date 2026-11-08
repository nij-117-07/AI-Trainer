// src/app/learning/explainer/atozpointer.tsx
import { RoadmapTab } from "@/features/explainer/components/RoadmapTab";
import { ToolScreen } from "@/features/testing-portal/components/ToolScreen";

export default function RoadmapRoute() {
  return (
    <ToolScreen title="Knowledge Roadmap">
      <RoadmapTab />
    </ToolScreen>
  );
}

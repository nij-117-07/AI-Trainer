// src/app/learning/explainer/orchestrate.tsx
import { JourneyTab } from "@/features/explainer/components/JourneyTab";
import { ToolScreen } from "@/components/tool/ToolScreen";

export default function JourneyRoute() {
  return (
    <ToolScreen title="Orchestrated Journey">
      <JourneyTab />
    </ToolScreen>
  );
}

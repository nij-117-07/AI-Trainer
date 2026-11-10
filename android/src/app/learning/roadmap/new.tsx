// src/app/learning/roadmap/new.tsx
import { useRouter } from "expo-router";
import { ResetButton } from "@/components/tool/ResetButton";
import { ToolScreen } from "@/components/tool/ToolScreen";
import { RoadmapCreateBody, RoadmapCreateFooter } from "@/features/roadmap/components/CreateRoadmapScreen";
import { useRoadmapCreate } from "@/features/roadmap/hooks/useRoadmapCreate";

export default function RoadmapNewRoute() {
  const router = useRouter();
  const state = useRoadmapCreate((roadmapId) => router.replace(`/learning/roadmap/${roadmapId}` as never));

  return (
    <ToolScreen
      title="New roadmap"
      headerRight={<ResetButton onPress={state.reset} />}
      footer={<RoadmapCreateFooter state={state} />}
    >
      <RoadmapCreateBody state={state} />
    </ToolScreen>
  );
}

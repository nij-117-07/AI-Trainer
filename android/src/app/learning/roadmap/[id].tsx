// src/app/learning/roadmap/[id].tsx
import { useLocalSearchParams } from "expo-router";
import { ToolScreen } from "@/components/tool/ToolScreen";
import { RoadmapDeleteAction, RoadmapDetailScreen } from "@/features/roadmap/components/RoadmapDetailScreen";
import { useRoadmapDetail } from "@/features/roadmap/hooks/useRoadmapDetail";

export default function RoadmapDetailRoute() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const state = useRoadmapDetail(String(id ?? ""));

  return (
    <ToolScreen
      title={state.roadmap?.subject ?? "Roadmap"}
      headerRight={state.roadmap ? <RoadmapDeleteAction state={state} /> : undefined}
    >
      <RoadmapDetailScreen state={state} />
    </ToolScreen>
  );
}

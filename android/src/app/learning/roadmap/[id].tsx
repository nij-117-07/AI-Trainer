// src/app/learning/roadmap/[id].tsx
import { useLocalSearchParams } from "expo-router";
import { RoadmapDetailScreen } from "@/features/roadmap/components/RoadmapDetailScreen";

export default function RoadmapDetailRoute() {
  const { id } = useLocalSearchParams<{ id: string }>();
  return <RoadmapDetailScreen roadmapId={String(id ?? "")} />;
}

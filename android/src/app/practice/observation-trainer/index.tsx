// src/app/practice/observation-trainer/index.tsx
import { ObservationTrainerScreen } from "@/features/observation-trainer/components/ObservationTrainerScreen";
import { ToolScreen } from "@/components/tool/ToolScreen";

export default function ObservationTrainerRoute() {
  return (
    <ToolScreen title="Observation Trainer">
      <ObservationTrainerScreen />
    </ToolScreen>
  );
}

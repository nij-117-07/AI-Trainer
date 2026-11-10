// src/app/practice/observation-trainer/new.tsx
import { useRouter } from "expo-router";
import { ResetButton } from "@/components/tool/ResetButton";
import { ToolScreen } from "@/components/tool/ToolScreen";
import { ObservationFormFields, ObservationFormFooter } from "@/features/observation-trainer/components/ObservationForm";
import { useObservationForm } from "@/features/observation-trainer/hooks/useObservationForm";

export default function ObservationTrainerNewRoute() {
  const router = useRouter();
  const training = useObservationForm(() => router.back());

  return (
    <ToolScreen
      title="New training"
      headerRight={<ResetButton onPress={training.reset} />}
      footer={<ObservationFormFooter training={training} />}
    >
      <ObservationFormFields training={training} />
    </ToolScreen>
  );
}

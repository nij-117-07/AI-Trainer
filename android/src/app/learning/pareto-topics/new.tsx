// src/app/learning/pareto-topics/new.tsx
import { useRouter } from "expo-router";
import { ResetButton } from "@/components/tool/ResetButton";
import { ToolScreen } from "@/components/tool/ToolScreen";
import { ParetoFormBody, ParetoFormFooter } from "@/features/pareto-topics/components/ParetoForm";
import { useParetoCreate } from "@/features/pareto-topics/hooks/useParetoCreate";

export default function ParetoTopicsNewRoute() {
  const router = useRouter();
  const state = useParetoCreate((listId) => router.replace(`/learning/pareto-topics/${listId}` as never));

  return (
    <ToolScreen
      title="New topic list"
      headerRight={<ResetButton onPress={state.reset} accessibilityLabel="Reset form" />}
      footer={<ParetoFormFooter state={state} />}
    >
      <ParetoFormBody state={state} />
    </ToolScreen>
  );
}

// src/app/practice/testing-portal/solver/new.tsx
import { useRouter } from "expo-router";
import { ResetButton } from "@/components/tool/ResetButton";
import { ToolScreen } from "@/components/tool/ToolScreen";
import { SolverFormFields, SolverFormFooter } from "@/features/testing-portal/components/SolverForm";
import { useSolverSetup } from "@/features/testing-portal/hooks/useSolverSetup";

export default function SolverNewRoute() {
  const router = useRouter();
  const setup = useSolverSetup(() => router.back());

  return (
    <ToolScreen
      title="New question"
      headerRight={<ResetButton label="Reset form" onPress={setup.reset} />}
      footer={<SolverFormFooter setup={setup} />}
    >
      <SolverFormFields setup={setup} />
    </ToolScreen>
  );
}

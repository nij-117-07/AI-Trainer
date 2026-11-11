// src/app/practice/executive-eq/new.tsx
import { useRouter } from "expo-router";
import { ResetButton } from "@/components/tool/ResetButton";
import { ToolScreen } from "@/components/tool/ToolScreen";
import { ExecutiveEqFormFields, ExecutiveEqFormFooter } from "@/features/executive-eq/components/ExecutiveEqForm";
import { useExecutiveEqSetup } from "@/features/executive-eq/hooks/useExecutiveEqSetup";

export default function ExecutiveEqNewRoute() {
  const router = useRouter();
  const setup = useExecutiveEqSetup(() => router.back());

  return (
    <ToolScreen
      title="New simulation"
      headerRight={<ResetButton onPress={setup.reset} accessibilityLabel="Reset form" />}
      footer={<ExecutiveEqFormFooter setup={setup} />}
    >
      <ExecutiveEqFormFields setup={setup} />
    </ToolScreen>
  );
}

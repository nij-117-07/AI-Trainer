// src/app/practice/clarity-trainer/new.tsx
import { useRouter } from "expo-router";
import { ResetButton } from "@/components/tool/ResetButton";
import { ToolScreen } from "@/components/tool/ToolScreen";
import { ClarityFormFields, ClarityFormFooter } from "@/features/clarity-trainer/components/ClarityForm";
import { useClaritySetup } from "@/features/clarity-trainer/hooks/useClaritySetup";

export default function ClarityTrainerNewRoute() {
  const router = useRouter();
  const setup = useClaritySetup(() => router.back());

  return (
    <ToolScreen
      title="New scenario"
      headerRight={<ResetButton onPress={setup.reset} />}
      footer={<ClarityFormFooter setup={setup} />}
    >
      <ClarityFormFields setup={setup} />
    </ToolScreen>
  );
}

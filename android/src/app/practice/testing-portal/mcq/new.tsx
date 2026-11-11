// src/app/practice/testing-portal/mcq/new.tsx
import { useRouter } from "expo-router";
import { ResetButton } from "@/components/tool/ResetButton";
import { ToolScreen } from "@/components/tool/ToolScreen";
import { McqFormFields, McqFormFooter } from "@/features/testing-portal/components/McqForm";
import { useMcqSetup } from "@/features/testing-portal/hooks/useMcqSetup";

export default function McqNewRoute() {
  const router = useRouter();
  const setup = useMcqSetup(() => router.back());

  return (
    <ToolScreen
      title="New MCQs"
      headerRight={<ResetButton label="Reset form" onPress={setup.reset} />}
      footer={<McqFormFooter setup={setup} />}
    >
      <McqFormFields setup={setup} />
    </ToolScreen>
  );
}

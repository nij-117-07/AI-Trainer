// src/app/practice/testing-portal/grader/new.tsx
import { useRouter } from "expo-router";
import { ResetButton } from "@/components/tool/ResetButton";
import { ToolScreen } from "@/components/tool/ToolScreen";
import { GraderFormFields, GraderFormFooter } from "@/features/testing-portal/components/GraderForm";
import { useGraderSetup } from "@/features/testing-portal/hooks/useGraderSetup";

export default function GraderNewRoute() {
  const router = useRouter();
  const setup = useGraderSetup(() => router.back());

  return (
    <ToolScreen
      title="New grade"
      headerRight={<ResetButton label="Reset form" onPress={setup.reset} />}
      footer={<GraderFormFooter setup={setup} />}
    >
      <GraderFormFields setup={setup} />
    </ToolScreen>
  );
}

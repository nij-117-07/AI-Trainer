// src/app/practice/interview/new.tsx
import { useRouter } from "expo-router";
import { ResetButton } from "@/components/tool/ResetButton";
import { ToolScreen } from "@/components/tool/ToolScreen";
import { SetupFormFields, SetupFormFooter } from "@/features/interview/components/SetupForm";
import { useInterviewSetup } from "@/features/interview/hooks/useInterviewSetup";

export default function InterviewNewRoute() {
  const router = useRouter();
  const setup = useInterviewSetup(() => router.back());

  return (
    <ToolScreen
      title="New interview"
      headerRight={<ResetButton onPress={setup.reset} accessibilityLabel="Reset form" />}
      footer={<SetupFormFooter setup={setup} />}
    >
      <SetupFormFields setup={setup} />
    </ToolScreen>
  );
}

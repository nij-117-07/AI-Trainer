// src/app/practice/testing-portal/answer/new.tsx
import { useRouter } from "expo-router";
import { ResetButton } from "@/components/tool/ResetButton";
import { ToolScreen } from "@/components/tool/ToolScreen";
import { AnswerFormFields, AnswerFormFooter } from "@/features/testing-portal/components/AnswerForm";
import { useAnswerSetup } from "@/features/testing-portal/hooks/useAnswerSetup";

export default function AnswerNewRoute() {
  const router = useRouter();
  const setup = useAnswerSetup(() => router.back());

  return (
    <ToolScreen
      title="New answer"
      headerRight={<ResetButton accessibilityLabel="Reset form" onPress={setup.reset} />}
      footer={<AnswerFormFooter setup={setup} />}
    >
      <AnswerFormFields setup={setup} />
    </ToolScreen>
  );
}

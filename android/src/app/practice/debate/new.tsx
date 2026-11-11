// src/app/practice/debate/new.tsx
import { useRouter } from "expo-router";
import { ResetButton } from "@/components/tool/ResetButton";
import { ToolScreen } from "@/components/tool/ToolScreen";
import { DebateFormFields, DebateFormFooter } from "@/features/debate/components/DebateForm";
import { useDebateSetup } from "@/features/debate/hooks/useDebateSetup";

export default function DebateNewRoute() {
  const router = useRouter();
  const setup = useDebateSetup(() => router.back());

  return (
    <ToolScreen
      title="New debate"
      headerRight={<ResetButton accessibilityLabel="Reset form" onPress={setup.reset} />}
      footer={<DebateFormFooter setup={setup} />}
    >
      <DebateFormFields setup={setup} />
    </ToolScreen>
  );
}

// src/app/practice/riddle/new.tsx
import { useRouter } from "expo-router";
import { ResetButton } from "@/components/tool/ResetButton";
import { ToolScreen } from "@/components/tool/ToolScreen";
import { RiddleFormFields, RiddleFormFooter } from "@/features/riddle/components/RiddleForm";
import { useRiddleSetup } from "@/features/riddle/hooks/useRiddleSetup";

export default function RiddleNewRoute() {
  const router = useRouter();
  const setup = useRiddleSetup(() => router.back());

  return (
    <ToolScreen
      title="New riddle"
      headerRight={<ResetButton onPress={setup.reset} accessibilityLabel="Reset form" />}
      footer={<RiddleFormFooter setup={setup} />}
    >
      <RiddleFormFields setup={setup} />
    </ToolScreen>
  );
}

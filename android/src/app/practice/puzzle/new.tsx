// src/app/practice/puzzle/new.tsx
import { useRouter } from "expo-router";
import { ResetButton } from "@/components/tool/ResetButton";
import { ToolScreen } from "@/components/tool/ToolScreen";
import { PuzzleFormFields, PuzzleFormFooter } from "@/features/puzzle/components/PuzzleForm";
import { usePuzzleSetup } from "@/features/puzzle/hooks/usePuzzleSetup";

export default function PuzzleNewRoute() {
  const router = useRouter();
  const setup = usePuzzleSetup(() => router.back());

  return (
    <ToolScreen
      title="New puzzle"
      headerRight={<ResetButton accessibilityLabel="Reset form" onPress={setup.reset} />}
      footer={<PuzzleFormFooter setup={setup} />}
    >
      <PuzzleFormFields setup={setup} />
    </ToolScreen>
  );
}

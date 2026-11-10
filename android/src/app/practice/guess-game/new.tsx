// src/app/practice/guess-game/new.tsx
import { useRouter } from "expo-router";
import { ResetButton } from "@/components/tool/ResetButton";
import { ToolScreen } from "@/components/tool/ToolScreen";
import { GuessGameFormFields, GuessGameFormFooter } from "@/features/guess-game/components/GuessGameForm";
import { useGuessGameSetup } from "@/features/guess-game/hooks/useGuessGameSetup";

export default function GuessGameNewRoute() {
  const router = useRouter();
  const setup = useGuessGameSetup(() => router.back());

  return (
    <ToolScreen
      title="New game"
      headerRight={<ResetButton onPress={setup.reset} />}
      footer={<GuessGameFormFooter setup={setup} />}
    >
      <GuessGameFormFields setup={setup} />
    </ToolScreen>
  );
}

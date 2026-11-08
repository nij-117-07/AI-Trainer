// src/app/practice/guess-game/index.tsx
import { GuessGameView } from "@/features/guess-game/components/GuessGameView";
import { ToolScreen } from "@/components/tool/ToolScreen";

export default function GuessGameRoute() {
  return (
    <ToolScreen title="Guess Game">
      <GuessGameView />
    </ToolScreen>
  );
}

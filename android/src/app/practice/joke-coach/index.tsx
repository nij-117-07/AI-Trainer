// src/app/practice/joke-coach/index.tsx
import { JokeCoachTool } from "@/features/joke-coach/components/JokeCoachTool";
import { ToolScreen } from "@/components/tool/ToolScreen";

export default function JokeCoachRoute() {
  return (
    <ToolScreen title="Joke Coach">
      <JokeCoachTool />
    </ToolScreen>
  );
}

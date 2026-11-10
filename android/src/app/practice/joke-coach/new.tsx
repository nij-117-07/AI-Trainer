// src/app/practice/joke-coach/new.tsx
import { useRouter } from "expo-router";
import { ResetButton } from "@/components/tool/ResetButton";
import { ToolScreen } from "@/components/tool/ToolScreen";
import { JokeLabFormFields, JokeLabFormFooter } from "@/features/joke-coach/components/JokeLabForm";
import { useJokeLabSetup } from "@/features/joke-coach/hooks/useJokeLabSetup";

export default function JokeLabNewRoute() {
  const router = useRouter();
  const setup = useJokeLabSetup(() => router.back());

  return (
    <ToolScreen
      title="New scenario"
      headerRight={<ResetButton onPress={setup.reset} />}
      footer={<JokeLabFormFooter setup={setup} />}
    >
      <JokeLabFormFields setup={setup} />
    </ToolScreen>
  );
}

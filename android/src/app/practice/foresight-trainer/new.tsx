// src/app/practice/foresight-trainer/new.tsx
import { useRouter } from "expo-router";
import { ResetButton } from "@/components/tool/ResetButton";
import { ToolScreen } from "@/components/tool/ToolScreen";
import { ForesightFormFields, ForesightFormFooter } from "@/features/foresight-trainer/components/ForesightForm";
import { useForesightSetup } from "@/features/foresight-trainer/hooks/useForesightSetup";

export default function ForesightNewRoute() {
  const router = useRouter();
  const setup = useForesightSetup(() => router.back());

  return (
    <ToolScreen
      title="New scenario"
      headerRight={<ResetButton onPress={setup.reset} />}
      footer={<ForesightFormFooter setup={setup} />}
    >
      <ForesightFormFields setup={setup} />
    </ToolScreen>
  );
}

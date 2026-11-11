// src/app/practice/testing-portal/theoretical/new.tsx
import { useRouter } from "expo-router";
import { ResetButton } from "@/components/tool/ResetButton";
import { ToolScreen } from "@/components/tool/ToolScreen";
import { TheoreticalFormFields, TheoreticalFormFooter } from "@/features/testing-portal/components/TheoreticalForm";
import { useTheoreticalSetup } from "@/features/testing-portal/hooks/useTheoreticalSetup";

export default function TheoreticalNewRoute() {
  const router = useRouter();
  const setup = useTheoreticalSetup(() => router.back());

  return (
    <ToolScreen
      title="New questions"
      headerRight={<ResetButton accessibilityLabel="Reset form" onPress={setup.reset} />}
      footer={<TheoreticalFormFooter setup={setup} />}
    >
      <TheoreticalFormFields setup={setup} />
    </ToolScreen>
  );
}

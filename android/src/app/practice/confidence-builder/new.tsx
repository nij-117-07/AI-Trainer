// src/app/practice/confidence-builder/new.tsx
import { useRouter } from "expo-router";
import { ResetButton } from "@/components/tool/ResetButton";
import { ToolScreen } from "@/components/tool/ToolScreen";
import { ConfidenceFormBody, ConfidenceFormFooter } from "@/features/confidence-builder/components/ConfidenceForm";
import { useConfidenceCreate } from "@/features/confidence-builder/hooks/useConfidenceCreate";

export default function ConfidenceBuilderNewRoute() {
  const router = useRouter();
  const state = useConfidenceCreate((setId) => router.replace(`/practice/confidence-builder/${setId}` as never));

  return (
    <ToolScreen
      title="New task set"
      headerRight={<ResetButton onPress={state.reset} accessibilityLabel="Reset form" />}
      footer={<ConfidenceFormFooter state={state} />}
    >
      <ConfidenceFormBody state={state} />
    </ToolScreen>
  );
}

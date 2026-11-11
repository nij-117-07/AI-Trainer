// src/app/practice/negotiation/new.tsx
import { useRouter } from "expo-router";
import { ResetButton } from "@/components/tool/ResetButton";
import { ToolScreen } from "@/components/tool/ToolScreen";
import { NegotiationFormFields, NegotiationFormFooter } from "@/features/negotiation/components/NegotiationForm";
import { useNegotiationSetup } from "@/features/negotiation/hooks/useNegotiationSetup";

export default function NegotiationNewRoute() {
  const router = useRouter();
  const setup = useNegotiationSetup(() => router.back());

  return (
    <ToolScreen
      title="New negotiation"
      headerRight={<ResetButton onPress={setup.reset} accessibilityLabel="Reset form" />}
      footer={<NegotiationFormFooter setup={setup} />}
    >
      <NegotiationFormFields setup={setup} />
    </ToolScreen>
  );
}

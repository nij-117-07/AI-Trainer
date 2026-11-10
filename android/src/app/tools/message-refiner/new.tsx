// src/app/tools/message-refiner/new.tsx
import { useRouter } from "expo-router";
import { ResetButton } from "@/components/tool/ResetButton";
import { Section } from "@/components/tool/Section";
import { ToolScreen } from "@/components/tool/ToolScreen";
import {
  MessageRefinerFormFields,
  MessageRefinerFormFooter,
  useMessageRefinerForm,
} from "@/features/message-refiner/components/MessageRefinerForm";

export default function MessageRefinerNewRoute() {
  const router = useRouter();
  const refiner = useMessageRefinerForm(() => router.back());

  return (
    <ToolScreen
      title="New message"
      headerRight={<ResetButton onPress={refiner.reset} />}
      footer={<MessageRefinerFormFooter refiner={refiner} />}
    >
      <Section>
        <MessageRefinerFormFields refiner={refiner} />
      </Section>
    </ToolScreen>
  );
}

// src/app/tools/message-refiner/index.tsx
import { useRouter } from "expo-router";
import { MessageSquareText, PenLine } from "lucide-react-native";
import { ActionButton } from "@/components/tool/FormControls";
import { EmptyHint } from "@/components/tool/EmptyHint";
import { Section } from "@/components/tool/Section";
import { ToolScreen } from "@/components/tool/ToolScreen";
import { MessageRefinerResultView } from "@/features/message-refiner/components/MessageRefinerResultView";
import { usePersistedRefinement } from "@/features/message-refiner/hooks/usePersistedDraft";

export default function MessageRefinerRoute() {
  const router = useRouter();
  const { saved, setSaved } = usePersistedRefinement();

  return (
    <ToolScreen
      title="Message Refiner"
      footer={
        <ActionButton label="New message" icon={PenLine} onPress={() => router.push("/tools/message-refiner/new")} />
      }
    >
      <Section>
        {saved ? (
          <MessageRefinerResultView saved={saved} onChange={setSaved} />
        ) : (
          <EmptyHint
            icon={MessageSquareText}
            title="No refined message yet"
            hint="Tap New message below, paste your draft, and choose a tone."
          />
        )}
      </Section>
    </ToolScreen>
  );
}

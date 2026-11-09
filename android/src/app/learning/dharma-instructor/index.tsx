// src/app/learning/dharma-instructor/index.tsx
import { AnswerComposer } from "@/components/tool/AnswerComposer";
import { ResetButton } from "@/components/tool/ResetButton";
import { ToolScreen } from "@/components/tool/ToolScreen";
import { DharmaChatView } from "@/features/dharma-instructor/components/DharmaChatView";
import { useDharmaChat } from "@/features/dharma-instructor/hooks/useDharmaChat";
import { MESSAGE_MAX } from "@/features/dharma-instructor/options";

export default function DharmaInstructorRoute() {
  const chat = useDharmaChat();

  return (
    <ToolScreen
      title="Dharma Instructor"
      headerRight={<ResetButton onPress={chat.reset} />}
      footer={
        <AnswerComposer
          label="Your question or situation"
          value={chat.draft}
          placeholder={chat.messages.length > 0 ? "Continue the conversation…" : "Ask about the Dharma, or describe a conflict…"}
          maxLength={MESSAGE_MAX}
          pending={chat.pending}
          error={chat.error}
          submitLabel="Send"
          onChangeText={chat.setDraft}
          onSubmit={() => void chat.send()}
        />
      }
    >
      <DharmaChatView chat={chat} />
    </ToolScreen>
  );
}

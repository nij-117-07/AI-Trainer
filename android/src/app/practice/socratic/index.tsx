// src/app/practice/socratic/index.tsx
import { AnswerComposer } from "@/components/tool/AnswerComposer";
import { ResetButton } from "@/components/tool/ResetButton";
import { ToolScreen } from "@/components/tool/ToolScreen";
import { SocraticTab } from "@/features/socratic/components/SocraticTab";
import { useSocraticChat } from "@/features/socratic/hooks/useSocraticChat";
import { STATEMENT_MAX } from "@/features/socratic/options";

export default function SocraticRoute() {
  const chat = useSocraticChat();

  return (
    <ToolScreen
      title="Socratic Challenger"
      headerRight={<ResetButton onPress={chat.reset} />}
      footer={
        <AnswerComposer
          label="Your claim or rebuttal"
          value={chat.draft}
          placeholder={chat.messages.length > 0 ? "Reply, or push back on a point…" : "State a belief or opinion…"}
          maxLength={STATEMENT_MAX}
          pending={chat.pending}
          error={chat.error}
          submitLabel="Send"
          onChangeText={chat.setDraft}
          onSubmit={() => void chat.send()}
        />
      }
    >
      <SocraticTab chat={chat} />
    </ToolScreen>
  );
}

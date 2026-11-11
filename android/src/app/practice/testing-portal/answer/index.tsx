// src/app/practice/testing-portal/answer/index.tsx
import { useRouter } from "expo-router";
import { BookOpen, Plus } from "lucide-react-native";
import { ActionButton } from "@/components/tool/FormControls";
import { EmptyHint } from "@/components/tool/EmptyHint";
import { Section } from "@/components/tool/Section";
import { ToolScreen } from "@/components/tool/ToolScreen";
import { AnswerResultView } from "@/features/testing-portal/components/AnswerResultView";
import { PortalLoading } from "@/features/testing-portal/components/PortalLoading";
import { useAnswerResult } from "@/features/testing-portal/hooks/useAnswerResult";

export default function AnswerRoute() {
  const router = useRouter();
  const expert = useAnswerResult();

  return (
    <ToolScreen
      title="Expert answer"
      footer={
        <ActionButton
          label="New answer"
          icon={Plus}
          onPress={() => router.push("/practice/testing-portal/answer/new")}
        />
      }
    >
      <Section>
        {expert.answer ? (
          <AnswerResultView answer={expert.answer} />
        ) : expert.loaded ? (
          <EmptyHint icon={BookOpen} title="No answer yet" hint="Add a question and context to get an expert answer." />
        ) : (
          <PortalLoading />
        )}
      </Section>
    </ToolScreen>
  );
}

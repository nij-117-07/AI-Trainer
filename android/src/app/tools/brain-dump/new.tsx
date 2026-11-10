// src/app/tools/brain-dump/new.tsx
import { useRouter } from "expo-router";
import { ResetButton } from "@/components/tool/ResetButton";
import { Section } from "@/components/tool/Section";
import { ToolScreen } from "@/components/tool/ToolScreen";
import { NewNoteFields, NewNoteFooter } from "@/features/brain-dump/components/NewNoteForm";
import { useNewNote } from "@/features/brain-dump/hooks/useNewNote";

export default function BrainDumpNewRoute() {
  const router = useRouter();
  const note = useNewNote(() => router.back());

  return (
    <ToolScreen
      title="New note"
      usesAi={false}
      headerRight={<ResetButton onPress={note.reset} />}
      footer={<NewNoteFooter note={note} />}
    >
      <Section>
        <NewNoteFields note={note} />
      </Section>
    </ToolScreen>
  );
}

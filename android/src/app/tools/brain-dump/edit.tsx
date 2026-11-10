// src/app/tools/brain-dump/edit.tsx
import { useLocalSearchParams, useRouter } from "expo-router";
import { SearchX } from "lucide-react-native";
import { EmptyHint } from "@/components/tool/EmptyHint";
import { Section } from "@/components/tool/Section";
import { ToolScreen } from "@/components/tool/ToolScreen";
import { NoteEditFields, NoteEditFooter } from "@/features/brain-dump/components/NoteEditForm";
import { useNoteEditor, useStoredNote } from "@/features/brain-dump/hooks/useNoteEditor";
import type { Note } from "@/features/brain-dump/types";

export default function BrainDumpEditRoute() {
  const { noteId } = useLocalSearchParams<{ noteId: string }>();
  const note = useStoredNote(noteId);

  if (note === undefined) {
    return <ToolScreen title="Edit note" usesAi={false}>{null}</ToolScreen>;
  }

  if (note === null) {
    return (
      <ToolScreen title="Edit note" usesAi={false}>
        <Section>
          <EmptyHint icon={SearchX} title="Note not found" hint="It may have been deleted. Go back to the list." />
        </Section>
      </ToolScreen>
    );
  }

  return <NoteEditPage key={note.id} note={note} />;
}

function NoteEditPage({ note }: { note: Note }) {
  const router = useRouter();
  const editor = useNoteEditor(note, () => router.back());

  return (
    <ToolScreen title="Edit note" usesAi={false} footer={<NoteEditFooter editor={editor} />}>
      <Section>
        <NoteEditFields editor={editor} />
      </Section>
    </ToolScreen>
  );
}

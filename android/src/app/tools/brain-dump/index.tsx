// src/app/tools/brain-dump/index.tsx
import { useRouter } from "expo-router";
import { NotebookPen } from "lucide-react-native";
import { ActionButton } from "@/components/tool/FormControls";
import { ToolScreen } from "@/components/tool/ToolScreen";
import { NotesList } from "@/features/brain-dump/components/NotesList";
import { useNotes } from "@/features/brain-dump/hooks/useNotes";

export default function BrainDumpRoute() {
  const router = useRouter();
  const store = useNotes();

  return (
    <ToolScreen
      title="Brain Dump & Notes"
      usesAi={false}
      footer={
        store.loaded ? (
          <ActionButton label="New note" icon={NotebookPen} onPress={() => router.push("/tools/brain-dump/new")} />
        ) : null
      }
    >
      <NotesList
        store={store}
        onOpen={(noteId) => router.push({ pathname: "/tools/brain-dump/edit", params: { noteId } })}
      />
    </ToolScreen>
  );
}

// src/app/tools/brain-dump/edit.tsx
import { StyleSheet, Text } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { SearchX } from "lucide-react-native";
import { spacing, typeScale, useThemeColors } from "@/theme";
import { EmptyHint } from "@/components/tool/EmptyHint";
import { Section } from "@/components/tool/Section";
import { ToolScreen } from "@/components/tool/ToolScreen";
import { NoteEditActions, NoteEditFields, NoteEditFooter } from "@/features/brain-dump/components/NoteEditForm";
import { useNoteEditor, useStoredNote } from "@/features/brain-dump/hooks/useNoteEditor";
import type { Note } from "@/features/brain-dump/types";

export default function BrainDumpEditRoute() {
  const colors = useThemeColors();
  const { noteId } = useLocalSearchParams<{ noteId: string }>();
  const note = useStoredNote(noteId);

  if (note === undefined) {
    return (
      <ToolScreen title="Edit note" usesAi={false}>
        <Text style={[styles.loading, { color: colors.mutedForeground }]}>Loading note…</Text>
      </ToolScreen>
    );
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

const styles = StyleSheet.create({
  loading: {
    ...typeScale.label,
    fontWeight: "400",
    paddingHorizontal: spacing.xs,
  },
});

function NoteEditPage({ note }: { note: Note }) {
  const router = useRouter();
  const editor = useNoteEditor(note, () => router.back());

  return (
    <ToolScreen
      title="Edit note"
      usesAi={false}
      headerRight={<NoteEditActions editor={editor} />}
      footer={<NoteEditFooter editor={editor} />}
    >
      <Section>
        <NoteEditFields editor={editor} />
      </Section>
    </ToolScreen>
  );
}

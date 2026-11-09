// src/features/voice-notes/components/VoiceNotesTool.tsx
/**
 * Voice notes: record a voice memo, transcribe it with the speech-to-text model from AI settings,
 * and keep the transcript as a note on the device. Tap a note to read or edit it.
 */
import { useEffect, useRef, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import {
  RecordingPresets,
  requestRecordingPermissionsAsync,
  setAudioModeAsync,
  useAudioRecorder,
  useAudioRecorderState,
} from "expo-audio";
import { ArrowLeft, FileText, Mic, RotateCw, Save, Square, Trash2 } from "lucide-react-native";
import { radius, spacing, useThemeColors } from "@/theme";
import { ActionButton, ErrorText, Panel, TextField } from "@/components/tool/FormControls";
import { Section } from "@/components/tool/Section";
import { useAiSettings } from "@/features/ai-settings/providers/AiSettingsProvider";
import { isVoiceConfigured, resolveVoiceConnection } from "@/features/ai-settings/lib/voice";
import { useVoiceNotes } from "../hooks/useVoiceNotes";
import { readRecording } from "../lib/audio";
import { createNote, formatDuration, previewText } from "../lib/notes";
import { transcribeAudio } from "../lib/transcribe";
import type { VoiceNote } from "../types";

const NOT_CONFIGURED = "Add the base URL, API key, and voice model in AI settings first.";

interface PendingRecording {
  uri: string;
  durationMs: number;
}

export function VoiceNotesTool() {
  const colors = useThemeColors();
  const { settings } = useAiSettings();
  const { notes, loaded, addNote, updateNote, removeNote } = useVoiceNotes();
  const recorder = useAudioRecorder(RecordingPresets.HIGH_QUALITY);
  const recorderState = useAudioRecorderState(recorder, 500);

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [pending, setPending] = useState<PendingRecording | null>(null);
  const [transcribing, setTranscribing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const startedAtRef = useRef(0);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => () => abortRef.current?.abort(), []);

  const voice = resolveVoiceConnection(settings);
  const configured = isVoiceConfigured(voice);
  const selected = notes.find((note) => note.id === selectedId) ?? null;
  const recording = recorderState.isRecording;

  async function startRecording() {
    setError(null);
    if (!configured) {
      setError(NOT_CONFIGURED);
      return;
    }
    try {
      const permission = await requestRecordingPermissionsAsync();
      if (!permission.granted) {
        setError("Microphone access is needed to record. Allow it in your device settings.");
        return;
      }
      await setAudioModeAsync({ allowsRecording: true, playsInSilentMode: true });
      await recorder.prepareToRecordAsync();
      recorder.record();
      startedAtRef.current = Date.now();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Could not start recording.");
    }
  }

  async function stopRecording() {
    const durationMs = Date.now() - startedAtRef.current;
    try {
      await recorder.stop();
      await setAudioModeAsync({ allowsRecording: false });
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Could not stop recording.");
      return;
    }
    const uri = recorder.uri;
    if (!uri) {
      setError("The recording was empty. Try again.");
      return;
    }
    const next = { uri, durationMs };
    setPending(next);
    await transcribe(next);
  }

  async function transcribe(recordingToSend: PendingRecording) {
    if (!configured) {
      setError(NOT_CONFIGURED);
      return;
    }
    const controller = new AbortController();
    abortRef.current = controller;
    setTranscribing(true);
    setError(null);
    try {
      const audio = await readRecording(recordingToSend.uri);
      const text = await transcribeAudio({
        connection: voice,
        audioBase64: audio.base64,
        format: audio.format,
        signal: controller.signal,
      });
      const note = createNote({
        text,
        model: voice.model,
        durationMs: recordingToSend.durationMs,
      });
      addNote(note);
      setPending(null);
      setSelectedId(note.id);
    } catch (cause) {
      if (controller.signal.aborted) return;
      setError(cause instanceof Error ? cause.message : "Transcription failed.");
    } finally {
      if (abortRef.current === controller) abortRef.current = null;
      setTranscribing(false);
    }
  }

  function discardPending() {
    setPending(null);
    setError(null);
  }

  if (selected) {
    return (
      <NoteEditor
        key={selected.id}
        note={selected}
        onBack={() => setSelectedId(null)}
        onSave={(patch) => updateNote(selected.id, patch)}
        onDelete={() => {
          removeNote(selected.id);
          setSelectedId(null);
        }}
      />
    );
  }

  const statusText = transcribing
    ? "Transcribing your recording…"
    : recording
      ? `Recording ${formatDuration(recorderState.durationMillis)}`
      : "Tap the microphone to record a voice note.";

  return (
    <Section>
      <Panel>
        <View style={styles.recordRow}>
          <Pressable
            onPress={recording ? stopRecording : startRecording}
            disabled={transcribing}
            accessibilityRole="button"
            accessibilityLabel={recording ? "Stop recording" : "Start recording"}
            accessibilityState={{ busy: transcribing, disabled: transcribing }}
            style={({ pressed }) => [
              styles.recordButton,
              { backgroundColor: recording ? colors.destructive : colors.primary },
              pressed && styles.pressed,
              transcribing && styles.disabled,
            ]}
          >
            {recording ? (
              <Square size={26} color={colors.primaryForeground} fill={colors.primaryForeground} />
            ) : (
              <Mic size={30} color={colors.primaryForeground} />
            )}
          </Pressable>
          <View style={styles.recordText}>
            <Text style={[styles.statusText, { color: colors.foreground }]} accessibilityLiveRegion="polite">
              {statusText}
            </Text>
            {configured ? null : (
              <Text style={[styles.hint, { color: colors.mutedForeground }]}>{NOT_CONFIGURED}</Text>
            )}
          </View>
        </View>

        {pending && !recording ? (
          <View style={[styles.pendingBox, { borderColor: colors.border, backgroundColor: colors.background }]}>
            <Text style={[styles.hint, { color: colors.mutedForeground }]}>
              The recording was not transcribed. Retry to keep the text, or discard it.
            </Text>
            <View style={styles.actionRow}>
              <View style={styles.flex}>
                <ActionButton
                  label="Retry transcription"
                  icon={RotateCw}
                  loading={transcribing}
                  onPress={() => transcribe(pending)}
                />
              </View>
              <View style={styles.flex}>
                <ActionButton label="Discard" variant="outline" onPress={discardPending} />
              </View>
            </View>
          </View>
        ) : null}

        <ErrorText message={error} />
      </Panel>

      <Text style={[styles.listTitle, { color: colors.foreground }]}>Notes</Text>
      {loaded && notes.length === 0 ? (
        <Text style={[styles.hint, { color: colors.mutedForeground }]}>
          No notes yet. Your transcripts will appear here.
        </Text>
      ) : null}
      {notes.map((note) => (
        <Pressable
          key={note.id}
          onPress={() => setSelectedId(note.id)}
          accessibilityRole="button"
          accessibilityLabel={`Open note ${note.title}`}
          style={({ pressed }) => [
            styles.noteCard,
            { backgroundColor: colors.card, borderColor: colors.border },
            pressed && { backgroundColor: colors.muted },
          ]}
        >
          <FileText size={20} color={colors.mutedForeground} />
          <View style={styles.noteBody}>
            <Text style={[styles.noteTitle, { color: colors.foreground }]} numberOfLines={1}>
              {note.title}
            </Text>
            <Text style={[styles.hint, { color: colors.mutedForeground }]} numberOfLines={2}>
              {previewText(note.text)}
            </Text>
            <Text style={[styles.meta, { color: colors.mutedForeground }]}>
              {formatNoteDate(note.createdAt)} · {formatDuration(note.durationMs)}
            </Text>
          </View>
        </Pressable>
      ))}
    </Section>
  );
}

function NoteEditor({
  note,
  onBack,
  onSave,
  onDelete,
}: {
  note: VoiceNote;
  onBack: () => void;
  onSave: (patch: Pick<VoiceNote, "title" | "text">) => void;
  onDelete: () => void;
}) {
  const colors = useThemeColors();
  const [title, setTitle] = useState(note.title);
  const [text, setText] = useState(note.text);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [saved, setSaved] = useState(false);

  const trimmedText = text.trim();
  const dirty = title !== note.title || trimmedText !== note.text;

  function save() {
    onSave({ title: title.trim() || note.title, text: trimmedText });
    setSaved(true);
  }

  return (
    <Section>
      <Pressable
        onPress={onBack}
        accessibilityRole="button"
        accessibilityLabel="Back to notes"
        style={({ pressed }) => [styles.backRow, pressed && { opacity: 0.7 }]}
      >
        <ArrowLeft size={18} color={colors.foreground} />
        <Text style={[styles.backText, { color: colors.foreground }]}>All notes</Text>
      </Pressable>

      <Panel>
        <TextField
          label="Title"
          value={title}
          onChangeText={(value) => {
            setTitle(value);
            setSaved(false);
          }}
          maxLength={120}
        />
        <TextField
          label="Transcript"
          value={text}
          onChangeText={(value) => {
            setText(value);
            setSaved(false);
          }}
          multiline
          style={styles.transcript}
        />
        <Text style={[styles.meta, { color: colors.mutedForeground }]}>
          {formatNoteDate(note.createdAt)} · {formatDuration(note.durationMs)}
          {note.model ? ` · ${note.model}` : ""}
        </Text>
        <View style={styles.actionRow}>
          <View style={styles.flex}>
            <ActionButton label={saved && !dirty ? "Saved" : "Save changes"} icon={Save} onPress={save} />
          </View>
        </View>
        {dirty && trimmedText === "" ? <ErrorText message="A note needs some text. Add text or delete the note." /> : null}
      </Panel>

      <Panel>
        {confirmDelete ? (
          <View style={styles.actionRow}>
            <View style={styles.flex}>
              <ActionButton label="Yes, delete note" icon={Trash2} onPress={onDelete} />
            </View>
            <View style={styles.flex}>
              <ActionButton label="Cancel" variant="outline" onPress={() => setConfirmDelete(false)} />
            </View>
          </View>
        ) : (
          <ActionButton label="Delete note" icon={Trash2} variant="outline" onPress={() => setConfirmDelete(true)} />
        )}
      </Panel>
    </Section>
  );
}

function formatNoteDate(iso: string): string {
  const date = new Date(iso);
  return Number.isNaN(date.getTime()) ? "" : date.toLocaleString();
}

const styles = StyleSheet.create({
  recordRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.lg,
  },
  recordButton: {
    width: 72,
    height: 72,
    borderRadius: radius.full,
    alignItems: "center",
    justifyContent: "center",
  },
  recordText: {
    flex: 1,
    gap: spacing.xs,
  },
  statusText: {
    fontSize: 16,
    fontWeight: "600",
  },
  hint: {
    fontSize: 14,
    lineHeight: 20,
  },
  meta: {
    fontSize: 12,
    lineHeight: 17,
  },
  pendingBox: {
    borderWidth: 1,
    borderRadius: radius.lg,
    padding: spacing.lg,
    gap: spacing.md,
  },
  actionRow: {
    flexDirection: "row",
    gap: spacing.md,
  },
  flex: {
    flex: 1,
  },
  listTitle: {
    fontSize: 18,
    fontWeight: "700",
  },
  noteCard: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: spacing.md,
    borderWidth: 1,
    borderRadius: radius.xl,
    padding: spacing.lg,
  },
  noteBody: {
    flex: 1,
    gap: spacing.xs,
  },
  noteTitle: {
    fontSize: 16,
    fontWeight: "600",
  },
  backRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    alignSelf: "flex-start",
  },
  backText: {
    fontSize: 15,
    fontWeight: "600",
  },
  transcript: {
    minHeight: 220,
  },
  pressed: {
    opacity: 0.85,
  },
  disabled: {
    opacity: 0.5,
  },
});

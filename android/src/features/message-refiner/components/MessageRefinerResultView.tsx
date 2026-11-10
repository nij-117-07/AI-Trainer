/**
 * The last refined message. The subject and message can be edited by hand, and each edit is saved
 * at once. "Edit with AI" applies one instruction to the current text and replaces it with the reply.
 */
import { useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { FileText, ListChecks, MessageSquareText, Sparkles } from "lucide-react-native";
import { radius, spacing, useThemeColors } from "@/theme";
import { useAiSettings } from "@/features/ai-settings/providers/AiSettingsProvider";
import { ActionButton, ErrorText, Panel, TextField } from "@/components/tool/FormControls";
import { CopyButton } from "@/components/tool/CopyButton";
import { ListenButton } from "@/components/tool/ListenButton";
import { ResultCallout } from "@/components/tool/ResultCallout";
import { SectionTitle } from "@/components/tool/SectionTitle";
import { useRequest } from "@/hooks/useRequest";
import { editRefinedMessage } from "../lib/generators";
import type { SavedMessageRefinement } from "../lib/persistence";
import { EDIT_INSTRUCTION_MAX, MESSAGE_MAX, SUBJECT_MAX } from "../lib/validate";
import { toneOptions } from "../options";
import type { MessageRefinerResult } from "../types";

interface MessageRefinerResultViewProps {
  saved: SavedMessageRefinement;
  onChange: (saved: SavedMessageRefinement) => void;
}

export function MessageRefinerResultView({ saved, onChange }: MessageRefinerResultViewProps) {
  const colors = useThemeColors();
  const { settings } = useAiSettings();
  const edit = useRequest(editRefinedMessage);
  const [instruction, setInstruction] = useState("");
  const { form, result } = saved;
  const toneLabel = toneOptions.find((option) => option.value === form.tone)?.label ?? form.tone;
  const busy = edit.pending;

  function update(patch: Partial<MessageRefinerResult>) {
    onChange({ ...saved, result: { ...result, ...patch } });
  }

  async function runAiEdit() {
    const next = await edit.run(settings, {
      message: result.refinedMessage,
      subjectLine: result.subjectLine,
      instruction,
      tone: form.tone,
      audience: form.audience,
      goal: form.goal,
    });
    if (!next) return;
    onChange({ ...saved, result: next });
    setInstruction("");
  }

  return (
    <>
      <SectionTitle icon={MessageSquareText} title={`Refined message · ${toneLabel}`} />
      <Panel>
        <TextField
          label="Subject line (optional)"
          placeholder="e.g. Moving our call to later"
          value={result.subjectLine}
          onChangeText={(text) => update({ subjectLine: text })}
          editable={!busy}
          maxLength={SUBJECT_MAX}
        />
        <TextField
          label="Message"
          hint="You can edit it. Copy and Listen use the text shown here."
          value={result.refinedMessage}
          onChangeText={(text) => update({ refinedMessage: text })}
          editable={!busy}
          multiline
          maxLength={MESSAGE_MAX}
          voice
        />
        <View style={styles.actions}>
          <CopyButton text={result.refinedMessage} label="Copy message" />
          <ListenButton text={result.refinedMessage} label="Refined message" />
        </View>
      </Panel>

      <Panel>
        <TextField
          label="Change it with AI"
          hint="The AI rewrites the message above. Your tone, audience, and goal are kept."
          placeholder="e.g. make it shorter, sound less formal, add a deadline"
          value={instruction}
          onChangeText={setInstruction}
          editable={!busy}
          maxLength={EDIT_INSTRUCTION_MAX}
          multiline
          voice
        />
        <ErrorText message={edit.error} />
        <ActionButton
          label={busy ? "Editing…" : "Edit with AI"}
          icon={Sparkles}
          variant="outline"
          loading={busy}
          disabled={instruction.trim() === "" || result.refinedMessage.trim() === ""}
          onPress={runAiEdit}
        />
      </Panel>

      {result.changes.length > 0 && (
        <ResultCallout icon={ListChecks} title="What changed" tone="emerald">
          {result.changes.map((change, index) => (
            <Text key={index} style={[styles.item, { color: colors.foreground }]}>
              • {change}
            </Text>
          ))}
        </ResultCallout>
      )}

      {form.message.trim() !== "" && (
        <>
          <SectionTitle icon={FileText} title="Your draft" />
          <View style={[styles.draft, { borderColor: colors.border }]}>
            <Text selectable style={[styles.draftText, { color: colors.mutedForeground }]}>
              {form.message}
            </Text>
          </View>
        </>
      )}
    </>
  );
}

const styles = StyleSheet.create({
  actions: { flexDirection: "row", gap: spacing.sm, flexWrap: "wrap" },
  item: { fontSize: 14, lineHeight: 21 },
  draft: { borderWidth: 1, borderRadius: radius.md, padding: spacing.md },
  draftText: { fontSize: 14, lineHeight: 21 },
});

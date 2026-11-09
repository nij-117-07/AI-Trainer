/** Message Refiner: rewrite a draft message for a tone, audience, and goal. */
import { useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { ListChecks, Mail, MessageSquareText, RefreshCcw, Sparkles } from "lucide-react-native";
import { radius, spacing, useThemeColors } from "@/theme";
import { useAiSettings } from "@/features/ai-settings/providers/AiSettingsProvider";
import { ActionButton, ChoiceChips, ErrorText, Panel, TextField } from "@/components/tool/FormControls";
import { Section } from "@/components/tool/Section";
import { SectionTitle } from "@/components/tool/SectionTitle";
import { CopyButton } from "@/components/tool/CopyButton";
import { ListenButton } from "@/components/tool/ListenButton";
import { ResultCallout } from "@/components/tool/ResultCallout";
import { useRequest } from "@/hooks/useRequest";
import { refineMessage } from "../lib/generators";
import { AUDIENCE_MAX, GOAL_MAX, MESSAGE_MAX } from "../lib/validate";
import { toneOptions } from "../options";
import type { MessageRefinerFormValues, MessageRefinerResult } from "../types";

const DEFAULTS: MessageRefinerFormValues = { message: "", tone: "friendly", audience: "", goal: "" };

export function MessageRefinerTool() {
  const colors = useThemeColors();
  const { settings } = useAiSettings();
  const request = useRequest(refineMessage);
  const [form, setForm] = useState<MessageRefinerFormValues>(DEFAULTS);

  const update = <K extends keyof MessageRefinerFormValues>(key: K, value: MessageRefinerFormValues[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  function reset() {
    setForm(DEFAULTS);
    request.reset();
  }

  const result: MessageRefinerResult | null = request.data;

  return (
    <Section>
      <Panel>
        <TextField
          label="Your message"
          placeholder="Paste or type the message you want to improve"
          value={form.message}
          onChangeText={(text) => update("message", text)}
          editable={!request.pending}
          multiline
          maxLength={MESSAGE_MAX}
          voice
        />
        <ChoiceChips options={toneOptions} value={form.tone} onChange={(value) => update("tone", value)} />
        <TextField
          label="Who is it for? (optional)"
          placeholder="e.g. my manager, a new client, a friend"
          value={form.audience}
          onChangeText={(text) => update("audience", text)}
          editable={!request.pending}
          maxLength={AUDIENCE_MAX}
        />
        <TextField
          label="What should it achieve? (optional)"
          placeholder="e.g. get a reply by Friday, confirm the meeting"
          value={form.goal}
          onChangeText={(text) => update("goal", text)}
          editable={!request.pending}
          maxLength={GOAL_MAX}
        />
        <ActionButton
          label={request.pending ? "Refining…" : "Refine message"}
          icon={Sparkles}
          loading={request.pending}
          onPress={() => request.run(settings, form)}
        />
      </Panel>

      <ErrorText message={request.error} />

      {result && (
        <>
          <SectionTitle icon={MessageSquareText} title="Refined message" />
          <Panel>
            {result.subjectLine.trim() !== "" && (
              <View style={styles.subjectRow}>
                <Mail size={16} color={colors.primary} />
                <Text selectable style={[styles.subject, { color: colors.foreground }]}>
                  {result.subjectLine}
                </Text>
              </View>
            )}
            <View style={[styles.messageBox, { borderColor: colors.border, backgroundColor: colors.background }]}>
              <Text selectable style={[styles.message, { color: colors.foreground }]}>
                {result.refinedMessage || "No message was returned."}
              </Text>
            </View>
            {result.refinedMessage.trim() !== "" && (
              <View style={styles.actions}>
                <CopyButton text={result.refinedMessage} label="Copy message" />
                <ListenButton text={result.refinedMessage} label="Refined message" />
              </View>
            )}
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
        </>
      )}

      <ActionButton label="Reset" icon={RefreshCcw} variant="outline" onPress={reset} />
    </Section>
  );
}

const styles = StyleSheet.create({
  subjectRow: { flexDirection: "row", alignItems: "center", gap: spacing.sm },
  subject: { flex: 1, fontSize: 16, fontWeight: "600" },
  messageBox: { borderWidth: 1, borderRadius: radius.md, padding: spacing.md },
  message: { fontSize: 15, lineHeight: 23 },
  actions: { flexDirection: "row", gap: spacing.sm, flexWrap: "wrap" },
  item: { fontSize: 14, lineHeight: 21 },
});

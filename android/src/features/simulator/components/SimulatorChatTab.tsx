// src/features/simulator/components/SimulatorChatTab.tsx
/**
 * Simulator Chat: a running, in-character conversation. The persona and scenario sit above the
 * transcript; the conversation, persona, scenario, and draft are kept on the device.
 */
import { StyleSheet, Text } from "react-native";
import { ListRestart, MessagesSquare } from "lucide-react-native";
import { useThemeColors } from "@/theme";
import { ActionButton, ErrorText, Panel, TextField } from "@/components/tool/FormControls";
import { Section } from "@/components/tool/Section";
import { SectionTitle } from "@/components/tool/SectionTitle";
import { useSimulatorChat } from "../hooks/useSimulatorChat";
import { ChatComposer } from "./ChatComposer";
import { ChatTranscript } from "./ChatTranscript";
import { SimulatorNav } from "./SimulatorNav";

export function SimulatorChatTab() {
  const colors = useThemeColors();
  const chat = useSimulatorChat();
  const { state, pending, error } = chat;

  return (
    <Section>
      <SimulatorNav current="chat" />

      <Panel>
        <TextField
          label="Persona"
          placeholder="e.g. A pragmatic retired starship captain."
          hint="The character the simulator will embody."
          value={state.persona}
          onChangeText={(persona) => chat.update({ persona })}
          editable={!pending}
          maxLength={1000}
          voice
        />
        <TextField
          label="Scenario"
          placeholder="e.g. Oxygen levels at 15%. Distress signal detected."
          hint="The setting the conversation takes place in."
          value={state.scenario}
          onChangeText={(scenario) => chat.update({ scenario })}
          editable={!pending}
          maxLength={2000}
          multiline
          voice
        />
      </Panel>

      <Panel>
        <SectionTitle icon={MessagesSquare} title="Conversation" />
        <ChatTranscript messages={state.history} pending={pending} />
        <ErrorText message={error} />
        <ChatComposer
          value={state.draft}
          onChangeText={(draft) => chat.update({ draft })}
          onSend={() => {
            void chat.send();
          }}
          pending={pending}
          placeholder="Deliver your next line…"
        />
        {state.history.length > 0 ? (
          <ActionButton label="New simulation" icon={ListRestart} variant="outline" onPress={chat.newConversation} />
        ) : null}
        {!chat.loaded ? <Text style={[styles.note, { color: colors.mutedForeground }]}>Loading conversation…</Text> : null}
      </Panel>
    </Section>
  );
}

const styles = StyleSheet.create({
  note: {
    fontSize: 13,
  },
});

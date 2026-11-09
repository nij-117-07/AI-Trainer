// src/features/battleground/components/BattlegroundTab.tsx
/**
 * Battleground Simulator screen. The setup form collapses once a battle is running so the
 * board stays on screen. Reset clears the form and the saved battle.
 */
import { useState } from "react";
import { StyleSheet, Text } from "react-native";
import { Swords, RefreshCcw } from "lucide-react-native";
import { spacing, useThemeColors } from "@/theme";
import { ActionButton, ErrorText, Panel, TextField } from "@/components/tool/FormControls";
import { SelectField } from "@/components/tool/SelectField";
import { SettingsToggle } from "@/components/tool/SettingsToggle";
import { Section } from "@/components/tool/Section";
import { useBattleSession } from "../hooks/useBattleSession";
import { DIFFICULTY_OPTIONS } from "../options";
import type { BattleDifficulty } from "../types";
import { BattleBoard } from "./BattleBoard";

export function BattlegroundTab() {
  const colors = useThemeColors();
  const battle = useBattleSession();
  const [settingsOpen, setSettingsOpen] = useState<boolean | null>(null);
  const { form, session, pending } = battle;
  const formOpen = settingsOpen ?? session === null;

  function update<K extends keyof typeof form>(key: K, value: (typeof form)[K]) {
    battle.setForm((prev) => ({ ...prev, [key]: value }));
  }

  function handleReset() {
    setSettingsOpen(null);
    battle.reset();
  }

  return (
    <Section>
      <SettingsToggle
        title="Battle setup"
        summary={`${form.topic.trim() || "No topic"} · ${form.difficulty}`}
        expanded={formOpen}
        onToggle={() => setSettingsOpen(!formOpen)}
      />

      {formOpen && (
        <Panel>
          <TextField
            label="Callsign"
            placeholder="e.g. Viper"
            value={form.name}
            onChangeText={(text) => update("name", text)}
            editable={!pending}
            maxLength={100}
          />
          <TextField
            label="Expertise"
            placeholder="e.g. cybersecurity, tactics"
            value={form.expertise}
            onChangeText={(text) => update("expertise", text)}
            editable={!pending}
            maxLength={300}
          />
          <TextField
            label="Preferred style"
            placeholder="e.g. aggressive, defensive, stealth"
            value={form.preferredStyle}
            onChangeText={(text) => update("preferredStyle", text)}
            editable={!pending}
            maxLength={300}
          />
          <TextField
            label="Background"
            placeholder="Brief experience story"
            value={form.background}
            onChangeText={(text) => update("background", text)}
            editable={!pending}
            maxLength={1000}
            multiline
            voice
          />
          <TextField
            label="Battleground topic"
            placeholder="e.g. Cybersecurity Ransomware Attack"
            value={form.topic}
            onChangeText={(text) => update("topic", text)}
            editable={!pending}
            maxLength={300}
          />
          <SelectField
            label="Difficulty"
            options={DIFFICULTY_OPTIONS}
            value={form.difficulty}
            onChange={(value) => update("difficulty", value as BattleDifficulty)}
            allowCustom={false}
          />
          <ActionButton
            label={pending ? "Deploying forces…" : session ? "Start a new battle" : "Enter the battleground"}
            icon={Swords}
            loading={pending}
            onPress={battle.start}
          />
        </Panel>
      )}

      {session ? (
        <BattleBoard session={session} pending={pending} error={battle.error} onCommit={battle.commit} />
      ) : (
        <>
          <Text style={[styles.empty, { color: colors.mutedForeground }]}>
            No battle in progress. Define your battleground and face an adaptive adversary.
          </Text>
          <ErrorText message={battle.error} />
        </>
      )}

      <ActionButton label="Reset" icon={RefreshCcw} variant="outline" onPress={handleReset} />
    </Section>
  );
}

const styles = StyleSheet.create({
  empty: {
    fontSize: 14,
    lineHeight: 20,
    paddingHorizontal: spacing.xs,
  },
});

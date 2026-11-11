// src/features/bias-inoculator/components/BiasInoculatorTab.tsx
/**
 * Cognitive Bias Inoculator screen: pick a field and a bias, then get a stealthy scenario with
 * the intuitive trap and the rational analysis. The last scenario is kept until Reset.
 */
import { StyleSheet, Text } from "react-native";
import { RefreshCcw, ShieldExclamationPoint } from "lucide-react-native";
import { useThemeColors } from "@/theme";
import { ActionButton, ErrorText, Panel, TextField } from "@/components/tool/FormControls";
import { SelectField } from "@/components/tool/SelectField";
import { Section } from "@/components/tool/Section";
import { useBiasInoculator } from "../hooks/useBiasInoculator";
import { TARGET_BIAS_OPTIONS } from "../options";
import { BiasResult } from "./BiasResult";

export function BiasInoculatorTab() {
  const colors = useThemeColors();
  const bias = useBiasInoculator();
  const { form, result, pending } = bias;

  function update<K extends keyof typeof form>(key: K, value: (typeof form)[K]) {
    bias.setForm((prev) => ({ ...prev, [key]: value }));
  }

  return (
    <Section>
      <Panel>
        <TextField
          label="Your field of interest"
          placeholder="e.g. Trading, Dating, Engineering"
          value={form.userInterest}
          onChangeText={(text) => update("userInterest", text)}
          editable={!pending}
          maxLength={200}
        />
        <SelectField
          label="Target bias"
          options={TARGET_BIAS_OPTIONS}
          value={form.targetBias}
          onChange={(value) => update("targetBias", value)}
          allowCustom={false}
        />
        <ActionButton
          label={pending ? "Setting the trap…" : "Generate scenario"}
          icon={ShieldExclamationPoint}
          loading={pending}
          onPress={bias.generate}
        />
      </Panel>

      <ErrorText message={bias.error} />

      {result ? (
        <BiasResult result={result} />
      ) : (
        <Text accessibilityLiveRegion="polite" style={[styles.empty, { color: colors.mutedForeground }]}>
          {pending
            ? "Building a scenario. This can take a moment."
            : "No scenario yet. Enter your field of interest, choose a bias, then generate one."}
        </Text>
      )}

      <ActionButton label="Reset form and scenario" icon={RefreshCcw} variant="outline" onPress={bias.reset} />
    </Section>
  );
}

const styles = StyleSheet.create({
  empty: {
    fontSize: 14,
    lineHeight: 20,
  },
});

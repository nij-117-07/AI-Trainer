/**
 * Cognitive Bias Inoculator screen: pick a field and a bias, then get a stealthy scenario. The
 * last scenario is kept until Reset.
 */
import { StyleSheet, View } from "react-native";
import { ShieldExclamationPoint } from "lucide-react-native";
import { spacing } from "@/theme";
import { ActionButton, ErrorText, Panel, TextField } from "@/components/tool/FormControls";
import { EmptyHint } from "@/components/tool/EmptyHint";
import { ResetButton } from "@/components/tool/ResetButton";
import { SelectField } from "@/components/tool/SelectField";
import { ToolScreen } from "@/components/tool/ToolScreen";
import { useBiasInoculator } from "../hooks/useBiasInoculator";
import { TARGET_BIAS_OPTIONS } from "../options";
import { BiasResult } from "./BiasResult";

export function BiasInoculatorTab() {
  const bias = useBiasInoculator();
  const { form, result, pending } = bias;

  function update<K extends keyof typeof form>(key: K, value: (typeof form)[K]) {
    bias.setForm((prev) => ({ ...prev, [key]: value }));
  }

  return (
    <ToolScreen
      title="Cognitive Bias Inoculator"
      headerRight={<ResetButton accessibilityLabel="Reset form and scenario" onPress={bias.reset} />}
      footer={
        <View style={styles.footer}>
          <ErrorText message={bias.error} />
          <ActionButton
            label={pending ? "Generating…" : "Generate scenario"}
            icon={ShieldExclamationPoint}
            loading={pending}
            onPress={bias.generate}
          />
        </View>
      }
    >
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
      </Panel>

      {result ? (
        <BiasResult result={result} />
      ) : (
        <View accessibilityLiveRegion="polite">
          <EmptyHint
            icon={ShieldExclamationPoint}
            title="No scenario yet"
            hint={
              pending
                ? "Building a scenario. This can take a moment."
                : "Enter a field and choose a bias, then tap Generate scenario."
            }
          />
        </View>
      )}
    </ToolScreen>
  );
}

const styles = StyleSheet.create({
  footer: {
    gap: spacing.md,
  },
});

// src/app/language-learner/translator/index.tsx
import { ResetButton } from "@/components/tool/ResetButton";
import { ToolScreen } from "@/components/tool/ToolScreen";
import { useLayout } from "@/theme";
import {
  TranslatorFooter,
  TranslatorResults,
  useTranslator,
} from "@/features/translator/components/TranslatorTool";

export default function TranslatorRoute() {
  const translator = useTranslator();
  const { size } = useLayout();
  const sideForm = size !== "phone";

  return (
    <ToolScreen
      title="Translator"
      headerRight={<ResetButton onPress={translator.reset} />}
      footer={sideForm ? <TranslatorFooter translator={translator} /> : undefined}
    >
      {sideForm ? null : <TranslatorFooter translator={translator} />}
      <TranslatorResults translator={translator} />
    </ToolScreen>
  );
}

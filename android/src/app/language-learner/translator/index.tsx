// src/app/language-learner/translator/index.tsx
import { ResetButton } from "@/components/tool/ResetButton";
import { ToolScreen } from "@/components/tool/ToolScreen";
import {
  TranslatorFooter,
  TranslatorResults,
  useTranslator,
} from "@/features/translator/components/TranslatorTool";

export default function TranslatorRoute() {
  const translator = useTranslator();

  return (
    <ToolScreen
      title="Translator"
      headerRight={<ResetButton onPress={translator.reset} />}
      footer={<TranslatorFooter translator={translator} />}
    >
      <TranslatorResults translator={translator} />
    </ToolScreen>
  );
}

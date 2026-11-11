// src/app/language-learner/translator/index.tsx
import { ResetButton } from "@/components/tool/ResetButton";
import { ToolScreen } from "@/components/tool/ToolScreen";
import {
  TranslatorFooter,
  TranslatorPanes,
  useTranslator,
} from "@/features/translator/components/TranslatorTool";

export default function TranslatorRoute() {
  const translator = useTranslator();

  return (
    <ToolScreen
      title="Translator"
      wide
      footerSide={false}
      headerRight={<ResetButton onPress={translator.reset} accessibilityLabel="Reset translator" />}
      footer={<TranslatorFooter translator={translator} />}
    >
      <TranslatorPanes translator={translator} />
    </ToolScreen>
  );
}

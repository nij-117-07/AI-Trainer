// src/app/tools/ingredients/new.tsx
import { useRouter } from "expo-router";
import { ResetButton } from "@/components/tool/ResetButton";
import { ToolScreen } from "@/components/tool/ToolScreen";
import {
  IngredientsFormFields,
  IngredientsFormFooter,
  useIngredientsForm,
} from "@/features/ingredients/components/IngredientsForm";

export default function IngredientsNewRoute() {
  const router = useRouter();
  const ingredients = useIngredientsForm(() => router.back());

  return (
    <ToolScreen
      title="New check"
      headerRight={<ResetButton onPress={ingredients.reset} />}
      footer={<IngredientsFormFooter ingredients={ingredients} />}
    >
      <IngredientsFormFields ingredients={ingredients} />
    </ToolScreen>
  );
}

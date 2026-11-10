// src/app/tools/creative-assets/new.tsx
import { useRouter } from "expo-router";
import { ResetButton } from "@/components/tool/ResetButton";
import { ToolScreen } from "@/components/tool/ToolScreen";
import {
  CreativeAssetsFormFields,
  CreativeAssetsFormFooter,
  useCreativeAssetsForm,
} from "@/features/creative-assets/components/CreativeAssetsForm";

export default function CreativeAssetsNewRoute() {
  const router = useRouter();
  const assets = useCreativeAssetsForm(() => router.back());

  return (
    <ToolScreen
      title="New assets"
      headerRight={<ResetButton onPress={assets.reset} />}
      footer={<CreativeAssetsFormFooter assets={assets} />}
    >
      <CreativeAssetsFormFields assets={assets} />
    </ToolScreen>
  );
}

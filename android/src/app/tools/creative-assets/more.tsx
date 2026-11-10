// src/app/tools/creative-assets/more.tsx
import { useRouter } from "expo-router";
import { ToolScreen } from "@/components/tool/ToolScreen";
import {
  CreativeAssetsMoreFields,
  CreativeAssetsMoreFooter,
  useCreativeAssetsMore,
} from "@/features/creative-assets/components/CreativeAssetsMore";

export default function CreativeAssetsMoreRoute() {
  const router = useRouter();
  const more = useCreativeAssetsMore(() => router.back());

  return (
    <ToolScreen title="More like these" footer={<CreativeAssetsMoreFooter more={more} />}>
      <CreativeAssetsMoreFields more={more} />
    </ToolScreen>
  );
}

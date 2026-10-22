import { Metadata } from "next";
import { SetPageTitle } from "@/features/navigation/components/SetPageTitle";
import { RoleplayPage } from "@/features/linguistic/roleplay/components/pages/RoleplayPage";

export const metadata: Metadata = {
  title: "Roleplay Chat | Linguistic",
  description: "Step into a scene with any persona you describe and hold an in-character conversation.",
};

export default function RoleplayRoutePage() {
  return (
    <>
      <SetPageTitle title="Roleplay Chat" />
      <RoleplayPage />
    </>
  );
}

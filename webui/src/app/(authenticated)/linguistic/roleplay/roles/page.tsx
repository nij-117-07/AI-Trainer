import { Metadata } from "next";
import { SetPageTitle } from "@/features/navigation/components/SetPageTitle";
import { RoleplayRolesPage } from "@/features/linguistic/roleplay/components/pages/RoleplayRolesPage";

export const metadata: Metadata = {
  title: "Roleplay Roles | Linguistic",
  description: "Manage the persona system prompts stored by the Roleplay Module service.",
};

export default function RoleplayRolesRoutePage() {
  return (
    <>
      <SetPageTitle title="Roleplay Roles" />
      <RoleplayRolesPage />
    </>
  );
}

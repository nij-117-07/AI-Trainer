import { Metadata } from "next";
import { SetPageTitle } from "@/features/navigation/components/SetPageTitle";
import { SkillTreeCreatePage } from "@/features/learning/skill-architect/components/SkillTreeCreatePage";

export const metadata: Metadata = {
  title: "Create Skill Tree | Learning",
  description: "Generate a new root-skill progression tree for any topic.",
};

export default function SkillArchitectNewRoutePage() {
  return (
    <>
      <SetPageTitle title="Create Skill Tree" />
      <SkillTreeCreatePage />
    </>
  );
}

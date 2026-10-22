import { Metadata } from "next";
import { SetPageTitle } from "@/features/navigation/components/SetPageTitle";
import { listTreesAction } from "@/features/learning/skill-architect/actions/trees";
import { SkillTreeListPage } from "@/features/learning/skill-architect/components/SkillTreeListPage";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export const metadata: Metadata = {
  title: "Skill Architect | Learning",
  description: "Deconstruct a domain into its root skills and a level-wise progression tree.",
};

export default async function SkillArchitectRoutePage() {
  const trees = await listTreesAction();

  return (
    <div className="mx-auto w-full max-w-5xl space-y-6">
      <SetPageTitle title="Skill Architect" />
      <SkillTreeListPage initialTrees={trees} />
    </div>
  );
}

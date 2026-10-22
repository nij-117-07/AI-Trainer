import { Metadata } from "next";
import { notFound } from "next/navigation";
import { SetPageTitle } from "@/features/navigation/components/SetPageTitle";
import { getTreeAction } from "@/features/learning/skill-architect/actions/trees";
import { SkillTreeDetailPage } from "@/features/learning/skill-architect/components/SkillTreeDetailPage";

export const dynamic = "force-dynamic";
export const revalidate = 0;

interface SkillTreeDetailProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({
  params,
}: SkillTreeDetailProps): Promise<Metadata> {
  const { id } = await params;
  const tree = await getTreeAction(id);
  return {
    title: tree ? `${tree.topic} | Skill Architect` : "Skill Architect",
  };
}

export default async function SkillTreeDetail({ params }: SkillTreeDetailProps) {
  const { id } = await params;
  const tree = await getTreeAction(id);
  if (!tree) notFound();

  return (
    <div className="mx-auto w-full max-w-4xl space-y-6">
      <SetPageTitle title={tree.topic} />
      <SkillTreeDetailPage initialTree={tree} />
    </div>
  );
}

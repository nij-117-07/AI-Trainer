import { redirect } from "next/navigation";

export default function ProjectBlueprintRedirectPage() {
  redirect("/learning/guides?tool=project-blueprint");
}
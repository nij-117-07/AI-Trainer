import { redirect } from "next/navigation";

export default function TutorPromptsRedirectPage() {
  redirect("/learning/tutor?tool=prompts");
}
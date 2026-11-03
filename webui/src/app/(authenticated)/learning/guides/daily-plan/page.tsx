import { redirect } from "next/navigation";

export default function DailyPlanRedirectPage() {
  redirect("/learning/guides?tool=daily-plan");
}
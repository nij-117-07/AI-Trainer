import { Metadata } from "next";
import { SetPageTitle } from "@/features/navigation/components/SetPageTitle";

export const metadata: Metadata = {
  title: "System Settings | Admin",
  description: "Configure application preferences and system settings.",
};

export default function AdminSettingsPage() {
  return (
    <>
      <SetPageTitle title="System Settings" />
      <div className="rounded-lg border border-border bg-card p-8 text-center text-muted-foreground">
        System settings will be implemented here.
      </div>
    </>
  );
}

import { Metadata } from "next";
import { SetPageTitle } from "@/features/navigation/components/SetPageTitle";

export const metadata: Metadata = {
  title: "Billing & Subscription | Admin",
  description: "Manage billing, subscriptions, and invoices.",
};

export default function AdminBillingPage() {
  return (
    <>
      <SetPageTitle title="Billing & Subscription" />
      <div className="rounded-lg border border-border bg-card p-8 text-center text-muted-foreground">
        Billing management will be implemented here.
      </div>
    </>
  );
}

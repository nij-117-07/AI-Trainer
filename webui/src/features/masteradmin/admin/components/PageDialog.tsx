// src/features/admin/components/PageDialog.tsx
/**
 * Dialog wrapper for the Page Form.
 * Manages modal state for create/edit operations.
 */

"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { PageForm } from "./PageForm";
import { Page } from "@/features/pages/types/page";
import { PageFormData } from "../actions/page-actions";

interface PageDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  page?: Page | null;
  onSubmit: (data: PageFormData) => Promise<{ success: boolean; error?: string }>;
  mode: "create" | "edit";
}

export function PageDialog({ 
  open, 
  onOpenChange, 
  page, 
  onSubmit, 
  mode 
}: PageDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {mode === "create" ? "Add New Page" : "Edit Page"}
          </DialogTitle>
          <DialogDescription>
            {mode === "create" 
              ? "Create a new dashboard page or external link. All fields are required." 
              : "Update the page details. Changes will reflect immediately on the dashboard."}
          </DialogDescription>
        </DialogHeader>
        
        <PageForm
          initialData={page || undefined}
          onSubmit={onSubmit}
          onCancel={() => onOpenChange(false)}
        />
      </DialogContent>
    </Dialog>
  );
}
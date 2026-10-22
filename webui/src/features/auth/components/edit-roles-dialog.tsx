// src/features/auth/components/edit-roles-dialog.tsx
/**
 * Dialog for admins to edit a user's roles.
 * Roles are entered as a comma-separated list.
 */

'use client';

import { useState, useTransition } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Shield } from 'lucide-react';
import { toast } from 'sonner';
import { updateUserRoles } from '../actions/admin';

interface EditRolesDialogProps {
  username: string;
  currentRoles: string[];
  onUpdated: () => void;
}

export function EditRolesDialog({ username, currentRoles, onUpdated }: EditRolesDialogProps) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(formData: FormData) {
    startTransition(async () => {
      const raw = formData.get('roles') as string;
      const roles = raw.split(',').map(r => r.trim()).filter(Boolean);
      const result = await updateUserRoles(username, roles);
      if (result.success) {
        toast.success(`Roles updated for ${username}`);
        setOpen(false);
        onUpdated();
      } else {
        toast.error(result.error ?? 'Failed to update roles');
      }
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Shield className="mr-1 h-3 w-3" />
          Roles
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>Edit Roles — {username}</DialogTitle>
        </DialogHeader>
        <form action={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="erd-roles">Roles (comma-separated)</Label>
            <Input
              id="erd-roles"
              name="roles"
              defaultValue={currentRoles.join(', ')}
              disabled={isPending}
            />
          </div>
          <Button type="submit" className="w-full" disabled={isPending}>
            {isPending ? 'Saving...' : 'Save Roles'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}

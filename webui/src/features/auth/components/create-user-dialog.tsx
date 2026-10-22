// src/features/auth/components/create-user-dialog.tsx
/**
 * Dialog for admin to create a new user.
 * Allows setting username, email, password, roles, and active status.
 */

'use client';

import { useState, useTransition } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Plus } from 'lucide-react';
import { toast } from 'sonner';
import { createUserByAdmin } from '../actions/admin';

interface CreateUserDialogProps {
  onCreated: () => void;
}

export function CreateUserDialog({ onCreated }: CreateUserDialogProps) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [active, setActive] = useState(true);

  function handleSubmit(formData: FormData) {
    startTransition(async () => {
      const result = await createUserByAdmin(formData);
      if (result.success) {
        toast.success('User created successfully');
        setOpen(false);
        onCreated();
      } else {
        toast.error(result.error ?? 'Failed to create user');
      }
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Create User
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Create New User</DialogTitle>
        </DialogHeader>
        <form action={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="cud-username">Username</Label>
            <Input id="cud-username" name="username" required disabled={isPending} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="cud-email">Email</Label>
            <Input id="cud-email" name="email" type="email" required disabled={isPending} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="cud-password">Password</Label>
            <Input id="cud-password" name="password" type="password" required disabled={isPending} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="cud-roles">Roles (comma-separated)</Label>
            <Input id="cud-roles" name="roles" placeholder="user,admin" defaultValue="user" disabled={isPending} />
          </div>
          <div className="flex items-center gap-2">
            <Checkbox id="cud-active" name="active" checked={active} onCheckedChange={(c) => setActive(c === true)} />
            <Label htmlFor="cud-active" className="text-sm font-normal">Active</Label>
          </div>
          <Button type="submit" className="w-full" disabled={isPending}>
            {isPending ? 'Creating...' : 'Create User'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}

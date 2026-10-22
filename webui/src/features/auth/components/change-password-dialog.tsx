// src/features/auth/components/change-password-dialog.tsx
/**
 * Dialog for admins to change a user's password.
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
import { KeyRound } from 'lucide-react';
import { toast } from 'sonner';
import { updateUserPassword } from '../actions/admin';

interface ChangePasswordDialogProps {
  username: string;
  onUpdated: () => void;
}

export function ChangePasswordDialog({ username, onUpdated }: ChangePasswordDialogProps) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(formData: FormData) {
    startTransition(async () => {
      const newPassword = formData.get('password') as string;
      const result = await updateUserPassword(username, newPassword);
      if (result.success) {
        toast.success(`Password changed for ${username}`);
        setOpen(false);
        onUpdated();
      } else {
        toast.error(result.error ?? 'Failed to change password');
      }
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <KeyRound className="mr-1 h-3 w-3" />
          Password
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>Change Password — {username}</DialogTitle>
        </DialogHeader>
        <form action={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="cpd-password">New Password</Label>
            <Input
              id="cpd-password"
              name="password"
              type="password"
              required
              minLength={6}
              placeholder="At least 6 characters"
              disabled={isPending}
            />
          </div>
          <Button type="submit" className="w-full" disabled={isPending}>
            {isPending ? 'Changing...' : 'Change Password'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// src/features/auth/components/user-management.tsx
/**
 * Admin user management panel.
 * Displays a table of users with actions to create, edit roles,
 * change passwords, and activate/deactivate accounts.
 */

'use client';

import { useState, useTransition, useCallback } from 'react';
import type { UserRecord } from '@/features/identity/types';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';
import { toggleUserActive } from '../actions/admin';
import { CreateUserDialog } from './create-user-dialog';
import { EditRolesDialog } from './edit-roles-dialog';
import { ChangePasswordDialog } from './change-password-dialog';

interface UserManagementProps {
  initialUsers: UserRecord[];
}

export function UserManagement({ initialUsers }: UserManagementProps) {
  const [users, setUsers] = useState<UserRecord[]>(initialUsers);
  const [isPending, startTransition] = useTransition();

  const refreshUsers = useCallback(async () => {
    const { getAllUsers } = await import('../actions/admin');
    const fresh = await getAllUsers();
    setUsers(fresh);
  }, []);

  function handleToggleActive(username: string) {
    startTransition(async () => {
      const result = await toggleUserActive(username);
      if (result.success) {
        toast.success(`User ${result.active ? 'activated' : 'deactivated'}`);
        refreshUsers();
      } else {
        toast.error(result.error ?? 'Failed to toggle status');
      }
    });
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <CreateUserDialog onCreated={refreshUsers} />
      </div>

      <div className="rounded-lg border border-border overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/50">
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">Username</th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">Email</th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">Roles</th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">Status</th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">Created</th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">
                  No users found
                </td>
              </tr>
            ) : (
              users.map((user) => (
                <tr key={user.username} className="border-b border-border last:border-0 hover:bg-muted/50">
                  <td className="px-4 py-3 font-medium text-foreground">{user.username}</td>
                  <td className="px-4 py-3 text-muted-foreground">{user.email}</td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-1">
                      {user.roles.map((role) => (
                        <Badge key={role} variant="secondary" className="text-xs">
                          {role}
                        </Badge>
                      ))}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={user.active}
                        disabled={isPending}
                        onCheckedChange={() => handleToggleActive(user.username)}
                      />
                      <span className={`text-xs font-medium ${user.active ? 'text-green-600' : 'text-muted-foreground'}`}>
                        {user.active ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">
                    {new Date(user.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      <EditRolesDialog username={user.username} currentRoles={user.roles} onUpdated={refreshUsers} />
                      <ChangePasswordDialog username={user.username} onUpdated={refreshUsers} />
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// src/features/identity/components/user-menu.tsx
'use client';

import { useTransition } from 'react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { LogOut, User, ShieldCheck } from 'lucide-react';
import type { UserIdentity } from '@/features/identity/types';
import { logoutUser } from '@/features/auth/actions/logout';

interface UserMenuProps {
  identity: UserIdentity;
}

/**
 * UserMenu: A dropdown trigger showing user initials and providing
 * quick actions like Logout and Group visibility.
 */
export function UserMenu({ identity }: UserMenuProps) {
  const [isPending, startTransition] = useTransition();
  const initial = identity.username.charAt(0).toUpperCase();

  const handleLogout = () => {
    startTransition(async () => {
      if (identity.logoutUrl === '/login?action=logout') {
        await logoutUser();
      } else {
        window.location.href = identity.logoutUrl;
      }
    });
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-10 w-10 rounded-full">
          <Avatar className="h-9 w-9">
            <AvatarFallback className="bg-primary text-primary-foreground font-bold">
              {initial}
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-64" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">{identity.username}</p>
            <p className="text-xs leading-none text-muted-foreground">
              {identity.email}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuLabel className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          Authorized Groups
        </DropdownMenuLabel>
        <div className="px-2 py-1.5 flex flex-wrap gap-1">
          {identity.groups.map((group) => (
            <span
              key={group}
              className="inline-flex items-center rounded-md bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700 ring-1 ring-inset ring-blue-700/10"
            >
              <ShieldCheck className="mr-1 h-3 w-3" />
              {group}
            </span>
          ))}
        </div>
        <DropdownMenuSeparator />
        <DropdownMenuItem 
          onClick={handleLogout}
          disabled={isPending}
          className="cursor-pointer text-red-600 focus:bg-red-50 focus:text-red-600"
        >
          <LogOut className="mr-2 h-4 w-4" />
          <span>{isPending ? 'Signing out...' : 'Sign out'}</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
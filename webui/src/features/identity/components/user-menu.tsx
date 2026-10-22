'use client';

import { useTransition } from 'react';
import { useRouter } from 'next/navigation';
import type { UserIdentity } from '@/features/identity/types';
import { logoutUser } from '@/features/auth/actions/logout';
import { Button } from '@/components/ui/button';
import { LogOut, User, ShieldCheck } from 'lucide-react';

interface UserMenuProps {
  identity: UserIdentity;
}

export function UserMenu({ identity }: UserMenuProps) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const handleLogout = () => {
    startTransition(async () => {
      if (identity.logoutUrl === '/login?action=logout') {
        await logoutUser();
        router.push('/select-mode');
        router.refresh();
      } else {
        window.location.href = identity.logoutUrl;
      }
    });
  };

  return (
    <div className="flex items-center gap-3">
      <div className="flex items-center gap-2 text-sm">
        <User className="h-4 w-4 text-muted-foreground" />
        <span className="font-medium">{identity.username}</span>
        {identity.groups.includes('admin') && (
          <ShieldCheck className="h-3.5 w-3.5 text-amber-500" />
        )}
      </div>
      <Button
        variant="ghost"
        size="sm"
        onClick={handleLogout}
        disabled={isPending}
        className="text-muted-foreground hover:text-destructive"
      >
        <LogOut className="h-4 w-4 mr-1" />
        Logout
      </Button>
    </div>
  );
}

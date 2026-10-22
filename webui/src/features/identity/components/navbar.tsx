// src/features/identity/components/navbar.tsx
/**
 * Main navigation bar for authenticated routes.
 * Displays branding, navigation links, and user menu.
 */

import { validateIdentity } from '../lib/auth-guard';
import { UserMenu } from './UserMenu';
import { LayoutDashboard, Shield } from 'lucide-react';
import Link from 'next/link';

export async function Navbar() {
  const identity = await validateIdentity();

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center">
        <div className="mr-4 flex">
          <Link href="/dashboard" className="flex items-center space-x-2">
            <Shield className="h-6 w-6 text-primary" />
            <span className="font-bold inline-block">SecureApp</span>
          </Link>
        </div>
        
        <div className="flex flex-1 items-center justify-between space-x-2 md:justify-end">
          <nav className="flex items-center space-x-6 text-sm font-medium">
            <Link 
              href="/dashboard" 
              className="transition-colors hover:text-foreground/80 text-foreground/60 flex items-center gap-2"
            >
              <LayoutDashboard className="h-4 w-4" />
              Dashboard
            </Link>
          </nav>
          
          <div className="flex items-center space-x-4">
            <UserMenu identity={identity} />
          </div>
        </div>
      </div>
    </header>
  );
}
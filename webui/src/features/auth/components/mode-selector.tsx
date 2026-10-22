// src/features/auth/components/mode-selector.tsx
'use client';

import { useTransition } from 'react';
import { Shield, User, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { selectAuthMode } from '../actions/mode';

/**
 * Presents user with authentication method choice.
 * Used on landing page or when mode is not yet selected.
 */
export function ModeSelector() {
  const [isPending, startTransition] = useTransition();

  const handleSelect = (mode: 'authentic' | 'standard') => {
    startTransition(async () => {
      await selectAuthMode(mode);
    });
  };

  return (
    <div className="w-full max-w-2xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-4 p-4">
      <Card className="hover:border-blue-500 transition-colors cursor-pointer relative overflow-hidden group border-2">
        <CardHeader>
          <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4 group-hover:bg-blue-200 transition-colors">
            <Shield className="w-6 h-6 text-blue-600" />
          </div>
          <CardTitle>Corporate SSO</CardTitle>
          <CardDescription>
            Authenticate via your organization&apos;s identity provider
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button
            onClick={() => handleSelect('authentic')}
            disabled={isPending}
            className="w-full group-hover:bg-blue-600"
          >
            {isPending ? 'Redirecting...' : 'Continue with SSO'}
            <ArrowRight className="ml-2 w-4 h-4" />
          </Button>
        </CardContent>
      </Card>

      <Card className="hover:border-slate-400 transition-colors cursor-pointer relative overflow-hidden group border-2">
        <CardHeader>
          <div className="w-12 h-12 bg-slate-100 rounded-lg flex items-center justify-center mb-4 group-hover:bg-slate-200 transition-colors">
            <User className="w-6 h-6 text-slate-600" />
          </div>
          <CardTitle>Standard Login</CardTitle>
          <CardDescription>
            Use local username and password credentials
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button
            onClick={() => handleSelect('standard')}
            disabled={isPending}
            variant="outline"
            className="w-full"
          >
            {isPending ? 'Redirecting...' : 'Login with Password'}
            <ArrowRight className="ml-2 w-4 h-4" />
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
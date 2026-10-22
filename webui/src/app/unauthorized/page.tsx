// src/app/unauthorized/page.tsx
/**
 * Unauthorized access page.
 * Displayed when authentication fails or headers are missing in production.
 */

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { AlertTriangle } from 'lucide-react';

export default function UnauthorizedPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 p-4">
      <div className="text-center space-y-6 max-w-md">
        <div className="flex justify-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
            <AlertTriangle className="w-8 h-8 text-red-600" />
          </div>
        </div>
        
        <div>
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Access Denied</h1>
          <p className="text-slate-600">
            You are not authorized to access this resource. Please ensure you are 
            properly authenticated through your identity provider.
          </p>
        </div>

        <div className="flex flex-col gap-3">
          <Link href="/select-mode">
            <Button className="w-full">Return to Login Selection</Button>
          </Link>
          <Link href="/login">
            <Button variant="outline" className="w-full">
              Try Standard Login
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
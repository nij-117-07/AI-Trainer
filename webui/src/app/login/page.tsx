// src/app/login/page.tsx
/**
 * Standard JWT login page.
 * Renders the login form for password-based authentication.
 */

import { LoginForm } from '@/features/auth/components/login-form';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function LoginPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background p-4">
      <div className="w-full max-w-md">
        <Link 
          href="/select-mode" 
          className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-6"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to selection
        </Link>
        
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold tracking-tight text-foreground mb-2">
            Standard Login
          </h1>
          <p className="text-muted-foreground">
            Enter your credentials to access your account
          </p>
        </div>
        
        <LoginForm />
        <p className="mt-6 text-center text-sm text-muted-foreground">
          Don&apos;t have an account?{' '}
          <Link href="/register" className="font-medium text-primary hover:text-primary/80">
            Register here
          </Link>
        </p>
      </div>
    </div>
  );
}
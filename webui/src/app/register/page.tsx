// src/app/register/page.tsx
/**
 * Registration page for new users.
 * Renders the registration form; new accounts are inactive until an admin activates them.
 */

import { RegisterForm } from '@/features/auth/components/register-form';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function RegisterPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background p-4">
      <div className="w-full max-w-md">
        <Link
          href="/login"
          className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-6"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to login
        </Link>

        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold tracking-tight text-foreground mb-2">
            Register
          </h1>
          <p className="text-muted-foreground">
            Create an account. An admin must activate it before you can log in.
          </p>
        </div>

        <RegisterForm />
      </div>
    </div>
  );
}

// src/features/auth/components/register-form.tsx
/**
 * Client component for user self-registration.
 * Features: debounced username availability check, password policy, confirm password.
 */

'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle, CheckCircle2, Loader2, Check, X } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { registerUser } from '../actions/register';
import { useUsernameCheck } from '../hooks/use-username-check';
import { CaptchaWidget } from './captcha-widget';

const PASSWORD_RULES = [
  { label: 'At least 8 characters', test: (p: string) => p.length >= 8 },
  { label: 'One uppercase letter', test: (p: string) => /[A-Z]/.test(p) },
  { label: 'One lowercase letter', test: (p: string) => /[a-z]/.test(p) },
  { label: 'One number', test: (p: string) => /\d/.test(p) },
  { label: 'One special character', test: (p: string) => /[^A-Za-z0-9]/.test(p) },
];

export function RegisterForm() {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const usernameStatus = useUsernameCheck(username);
  const router = useRouter();

  const passwordsMatch = confirmPassword.length > 0 && password === confirmPassword;
  const allRulesMet = PASSWORD_RULES.every(r => r.test(password));

  const canSubmit = usernameStatus === 'available' && allRulesMet && passwordsMatch && !isPending;

  function handleSubmit(formData: FormData) {
    setError(null);
    if (!passwordsMatch) {
      setError('Passwords do not match');
      return;
    }
    if (!allRulesMet) {
      setError('Password does not meet all requirements');
      return;
    }
    startTransition(async () => {
      const result = await registerUser(formData);
      if (result.success) {
        setSuccess(true);
        setTimeout(() => router.push('/login'), 2000);
      } else {
        setError(result.error ?? null);
      }
    });
  }

  if (success) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardContent className="pt-8 text-center space-y-4">
          <CheckCircle2 className="h-12 w-12 text-green-500 mx-auto" />
          <p className="text-lg font-medium text-slate-900">Registration successful!</p>
          <p className="text-sm text-slate-500">
            Your account is pending admin activation. Redirecting to login...
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl text-center">Create Account</CardTitle>
      </CardHeader>
      <form action={handleSubmit}>
        <CardContent className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Username */}
          <div className="space-y-2">
            <Label htmlFor="username">Username</Label>
            <div className="relative">
              <Input
                id="username"
                name="username"
                required
                disabled={isPending}
                placeholder="Choose a username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="pr-8"
              />
              <span className="absolute right-2.5 top-1/2 -translate-y-1/2">
                {usernameStatus === 'checking' && <Loader2 className="h-4 w-4 animate-spin text-slate-400" />}
                {usernameStatus === 'available' && <Check className="h-4 w-4 text-green-500" />}
                {usernameStatus === 'unavailable' && <X className="h-4 w-4 text-red-500" />}
              </span>
            </div>
            {usernameStatus === 'unavailable' && (
              <p className="text-xs text-red-500">Username is already taken</p>
            )}
            {usernameStatus === 'available' && (
              <p className="text-xs text-green-500">Username is available</p>
            )}
          </div>

          {/* Email */}
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" name="email" type="email" required disabled={isPending} placeholder="you@example.com" />
          </div>

          {/* Password */}
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              name="password"
              type="password"
              required
              disabled={isPending}
              placeholder="Choose a password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          {/* Password policy */}
          {password.length > 0 && (
            <ul className="space-y-1 text-xs">
              {PASSWORD_RULES.map((rule) => {
                const met = rule.test(password);
                return (
                  <li key={rule.label} className={`flex items-center gap-1.5 ${met ? 'text-green-600' : 'text-slate-400'}`}>
                    {met ? <Check className="h-3 w-3" /> : <div className="h-3 w-3 rounded-full border border-slate-300" />}
                    {rule.label}
                  </li>
                );
              })}
            </ul>
          )}

          {/* Confirm Password */}
          <div className="space-y-2">
            <Label htmlFor="confirm-password">Confirm Password</Label>
            <Input
              id="confirm-password"
              type="password"
              required
              disabled={isPending}
              placeholder="Re-enter your password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
            {confirmPassword.length > 0 && !passwordsMatch && (
              <p className="text-xs text-red-500">Passwords do not match</p>
            )}
          </div>
        </CardContent>
        <CardFooter className="flex flex-col gap-3">
          <CaptchaWidget />
          <Button type="submit" className="w-full" disabled={!canSubmit}>
            {isPending ? 'Creating account...' : 'Create account'}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}

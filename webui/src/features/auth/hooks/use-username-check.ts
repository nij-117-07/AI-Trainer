// src/features/auth/hooks/use-username-check.ts
/**
 * Custom hook for debounced username availability check.
 * Waits 400ms after the user stops typing before querying the server.
 */

'use client';

import { useState, useEffect, useRef } from 'react';
import { checkUsernameAvailable } from '../actions/register';

type UsernameStatus = 'idle' | 'checking' | 'available' | 'unavailable';

export function useUsernameCheck(username: string) {
  const [status, setStatus] = useState<UsernameStatus>(
    !username || username.length < 2 ? 'idle' : 'checking'
  );
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    if (!username || username.length < 2) return;
    timerRef.current = setTimeout(async () => {
      setStatus('checking');
      const { available } = await checkUsernameAvailable(username);
      setStatus(available ? 'available' : 'unavailable');
    }, 400);
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [username]);

  if (!username || username.length < 2) return 'idle';
  return status;
}

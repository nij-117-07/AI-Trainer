// src/hooks/useLocalStorage.ts

import { useState, useCallback } from 'react';

export function useLocalStorage<T>(key: string, initialValue: T) {
  const [value, setValue] = useState<T>(() => {
    if (typeof window === 'undefined') return initialValue;
    try {
      const item = window.localStorage.getItem(key);
      return item ? (JSON.parse(item) as T) : initialValue;
    } catch {
      return initialValue;
    }
  });

  const setValueWrapper = useCallback(
    (newValue: T | ((prev: T) => T)) => {
      setValue((prev) => {
        const resolved = typeof newValue === 'function' ? (newValue as (prev: T) => T)(prev) : newValue;
        try {
          window.localStorage.setItem(key, JSON.stringify(resolved));
        } catch { /* quota exceeded */ }
        return resolved;
      });
    },
    [key]
  );

  const removeValue = useCallback(() => {
    try {
      window.localStorage.removeItem(key);
    } catch { /* ignore */ }
    setValue(initialValue);
  }, [key, initialValue]);

  return { value, setValue: setValueWrapper, removeValue };
}

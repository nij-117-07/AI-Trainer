'use client';

import { createContext, useContext, useState, type ReactNode } from 'react';

interface PageTitleContextValue {
  title: string;
  setPageTitle: (title: string) => void;
}

const PageTitleContext = createContext<PageTitleContextValue | null>(null);

export function PageTitleProvider({ children }: { children: ReactNode }) {
  const [title, setPageTitle] = useState('');
  return (
    <PageTitleContext.Provider value={{ title, setPageTitle }}>
      {children}
    </PageTitleContext.Provider>
  );
}

export function usePageTitle() {
  const ctx = useContext(PageTitleContext);
  if (!ctx) throw new Error('usePageTitle must be used within PageTitleProvider');
  return ctx;
}

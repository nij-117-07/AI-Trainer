'use client';

import { useEffect } from 'react';
import { usePageTitle } from './page-title-context';

export function SetPageTitle({ title }: { title: string }) {
  const { setPageTitle } = usePageTitle();
  useEffect(() => { setPageTitle(title); }, [setPageTitle, title]);
  return null;
}

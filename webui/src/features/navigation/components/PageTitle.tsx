'use client';

import { usePageTitle } from './page-title-context';

export function PageTitle() {
  const { title } = usePageTitle();

  if (!title) return null;

  return (
    <span className="text-sm font-medium text-muted-foreground hidden md:inline">
      {title}
    </span>
  );
}

'use client';

import { useEffect } from 'react';
import { useUIStore } from '@/lib/store';

export function ClientLayout({ children }: { children: React.ReactNode }) {
  const { isDarkMode } = useUIStore();

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  return <>{children}</>;
}

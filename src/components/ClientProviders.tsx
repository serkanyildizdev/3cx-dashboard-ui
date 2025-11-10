'use client';

import { ReactNode } from 'react';
import { LanguageProvider } from '@/contexts/LanguageContext';
import { DashboardLayout } from '@/components/layout/DashboardLayout';

export function ClientProviders({ children }: { children: ReactNode }) {
  return (
    <LanguageProvider>
      <DashboardLayout>{children}</DashboardLayout>
    </LanguageProvider>
  );
}

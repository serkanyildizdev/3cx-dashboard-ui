'use client';

import { ReactNode } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Users,
  Phone,
  BarChart3,
  TrendingUp,
  Clock,
  Activity,
  Monitor,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { useWebSocket } from '@/hooks/useWebSocket';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';
import { useLanguage } from '@/contexts/LanguageContext';

interface NavItem {
  title: string;
  href: string;
  icon: any;
}

interface NavigationConfig {
  key: keyof typeof import('../../messages/de.json')['navigation'];
  href: string;
  icon: any;
}

const navigationConfig: NavigationConfig[] = [
  { key: 'realtime', href: '/', icon: Activity },
  { key: 'tvDisplay', href: '/display', icon: Monitor },
  { key: 'agents', href: '/agents', icon: Users },
  { key: 'activeCalls', href: '/calls', icon: Phone },
  { key: 'statistics', href: '/statistics', icon: BarChart3 },
  { key: 'comparison', href: '/comparison', icon: TrendingUp },
  { key: 'leaderboard', href: '/leaderboard', icon: Clock },
];

export function DashboardLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const { isConnected } = useWebSocket();
  const { t } = useLanguage();

  // Hide sidebar for display page (TV mode)
  const isDisplayPage = pathname === '/display';

  if (isDisplayPage) {
    return <>{children}</>;
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-200 fixed h-full">
        <div className="p-6">
          <div className="flex items-center space-x-3">
            <Image
              src="/logo.png"
              alt="Spiegel21 Logo"
              width={120}
              height={40}
              className="object-contain"
              priority
            />
          </div>
          <div className="mt-2">
            <p className="text-xs text-gray-500">Support Dashboard</p>
          </div>

          {/* WebSocket Status */}
          <div className="mt-4 flex items-center space-x-2">
            <div
              className={cn(
                'h-2 w-2 rounded-full',
                isConnected ? 'bg-green-500' : 'bg-red-500'
              )}
            />
            <span className="text-xs text-gray-600">
              {isConnected ? t.common.connected : t.common.disconnected}
            </span>
          </div>

          {/* Language Switcher */}
          <div className="mt-4">
            <LanguageSwitcher />
          </div>
        </div>

        <nav className="px-4 space-y-1">
          {navigationConfig.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-blue-50 text-blue-600'
                    : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                )}
              >
                <Icon className="h-5 w-5" />
                <span>{t.navigation[item.key]}</span>
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200">
          <div className="text-xs text-gray-500">
            <p className="font-medium">Spiegel21 Support</p>
            <p className="mt-1">Queue: 806</p>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 ml-64">
        <div className="p-8">{children}</div>
      </main>
    </div>
  );
}

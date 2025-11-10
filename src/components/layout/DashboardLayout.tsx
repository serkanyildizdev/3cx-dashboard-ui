'use client';

import { ReactNode } from 'react';
import Link from 'next/link';
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

interface NavItem {
  title: string;
  href: string;
  icon: any;
}

const navigation: NavItem[] = [
  {
    title: 'Gerçek Zamanlı',
    href: '/',
    icon: Activity,
  },
  {
    title: 'TV Görünüm',
    href: '/display',
    icon: Monitor,
  },
  {
    title: 'Ajanlar',
    href: '/agents',
    icon: Users,
  },
  {
    title: 'Aktif Çağrılar',
    href: '/calls',
    icon: Phone,
  },
  {
    title: 'İstatistikler',
    href: '/statistics',
    icon: BarChart3,
  },
  {
    title: 'Karşılaştırma',
    href: '/comparison',
    icon: TrendingUp,
  },
  {
    title: 'Liderlik Tablosu',
    href: '/leaderboard',
    icon: Clock,
  },
];

export function DashboardLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const { isConnected } = useWebSocket();

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-200 fixed h-full">
        <div className="p-6">
          <div className="flex items-center space-x-2">
            <LayoutDashboard className="h-8 w-8 text-blue-600" />
            <div>
              <h1 className="text-xl font-bold text-gray-900">3CX Dashboard</h1>
              <p className="text-xs text-gray-500">Support Team</p>
            </div>
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
              {isConnected ? 'Bağlı' : 'Bağlantı Kesildi'}
            </span>
          </div>
        </div>

        <nav className="px-4 space-y-1">
          {navigation.map((item) => {
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
                <span>{item.title}</span>
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

'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { statsAPI, AgentCallStatistics } from '@/lib/api';
import { Skeleton } from '@/components/ui/skeleton';
import { useLanguage } from '@/contexts/LanguageContext';

export default function StatisticsPage() {
  const { t } = useLanguage();
  const [period, setPeriod] = useState('today');
  const [stats, setStats] = useState<AgentCallStatistics[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const res = await statsAPI.getAllAgentsStats(period);
        if (res.data.data?.agents) {
          setStats(res.data.data.agents);
        } else {
          setStats([]);
        }
      } catch (error) {
        console.error('Failed to fetch stats:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [period]);

  const totalCalls = stats.reduce((acc, s) => acc + s.total_calls, 0);
  const totalAnswered = stats.reduce((acc, s) => acc + s.answered_calls, 0);
  const totalMissed = stats.reduce((acc, s) => acc + s.missed_calls, 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{t.statistics.title}</h1>
          <p className="text-gray-600 mt-1">{t.statistics.subtitle}</p>
        </div>
        <Select value={period} onValueChange={setPeriod}>
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="today">{t.common.today}</SelectItem>
            <SelectItem value="week">{t.common.thisWeek}</SelectItem>
            <SelectItem value="month">{t.common.thisMonth}</SelectItem>
            <SelectItem value="last7days">{t.common.last7days}</SelectItem>
            <SelectItem value="last30days">{t.common.last30days}</SelectItem>
            <SelectItem value="year">{t.common.thisYear}</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {loading ? (
        <Skeleton className="h-96 w-full" />
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>{t.statistics.totalCalls}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-4xl font-bold">{totalCalls}</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>{t.statistics.answered}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-4xl font-bold text-green-600">{totalAnswered}</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>{t.statistics.missed}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-4xl font-bold text-red-600">{totalMissed}</p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>{t.statistics.agentStats}</CardTitle>
              <CardDescription>{stats.length} {t.statistics.agents}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {stats.map((stat) => (
                  <div key={stat.agent_ext} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex-1">
                      <p className="font-medium">{stat.agent_name || stat.agent_ext}</p>
                      <p className="text-sm text-gray-600">{t.agents.extension}: {stat.agent_ext}</p>
                    </div>
                    <div className="grid grid-cols-4 gap-4 text-center">
                      <div>
                        <p className="text-sm text-gray-600">{t.common.total}</p>
                        <p className="text-lg font-bold">{stat.total_calls}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">{t.statistics.answered}</p>
                        <p className="text-lg font-bold text-green-600">{stat.answered_calls}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">{t.statistics.missed}</p>
                        <p className="text-lg font-bold text-red-600">{stat.missed_calls}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">{t.statistics.avgDuration}</p>
                        <p className="text-lg font-bold">{stat.average_duration.toFixed(0)}s</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}

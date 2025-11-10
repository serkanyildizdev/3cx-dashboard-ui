'use client';

import { useEffect, useState } from 'react';
import { Activity, Phone, Users, Clock, TrendingUp, TrendingDown, PhoneCall, PhoneOff, Timer, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  dashboardAPI,
  callsAPI,
  agentsAPI,
  RealTimeStatus,
  SLAMetrics,
  HourlyDistribution,
  Call,
  Agent
} from '@/lib/api';
import { useWebSocket } from '@/hooks/useWebSocket';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { formatDistance } from 'date-fns';
import { tr } from 'date-fns/locale';

export default function HomePage() {
  const [realTimeData, setRealTimeData] = useState<RealTimeStatus | null>(null);
  const [slaData, setSlaData] = useState<SLAMetrics | null>(null);
  const [hourlyData, setHourlyData] = useState<HourlyDistribution | null>(null);
  const [activeCalls, setActiveCalls] = useState<Call[]>([]);
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);
  const { isConnected, lastMessage } = useWebSocket();

  // Fetch initial data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [realTimeRes, slaRes, hourlyRes, callsRes, agentsRes] = await Promise.all([
          dashboardAPI.getRealTimeStatus(),
          dashboardAPI.getSLAMetrics('today'),
          dashboardAPI.getHourlyDistribution('today'),
          callsAPI.getActive(),
          agentsAPI.getAll(),
        ]);

        if (realTimeRes.data.data) setRealTimeData(realTimeRes.data.data);
        if (slaRes.data.data) setSlaData(slaRes.data.data);
        if (hourlyRes.data.data) setHourlyData(hourlyRes.data.data);
        if (callsRes.data.data?.calls) setActiveCalls(callsRes.data.data.calls);
        if (agentsRes.data.data?.agents) setAgents(agentsRes.data.data.agents);
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();

    // Refresh every 5 seconds for real-time feel
    const interval = setInterval(fetchData, 5000);
    return () => clearInterval(interval);
  }, []);

  // Handle WebSocket updates
  useEffect(() => {
    if (lastMessage) {
      console.log('WebSocket message:', lastMessage.type, lastMessage.data);
      // Trigger data refresh on call events
      if (lastMessage.type !== 'welcome') {
        dashboardAPI.getRealTimeStatus().then((res) => {
          if (res.data.data) setRealTimeData(res.data.data);
        });
      }
    }
  }, [lastMessage]);

  // Prepare chart data
  const chartData = hourlyData?.hourly_stats
    ? hourlyData.hourly_stats.map((stat) => ({
        hour: `${stat.hour}:00`,
        'Çağrı Sayısı': stat.call_count || 0,
      }))
    : [];

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Gerçek Zamanlı Dashboard</h1>
          <p className="text-gray-600 mt-1">Anlık destek ekibi performansı</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-4 w-20" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-16" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Gerçek Zamanlı Dashboard</h1>
          <p className="text-gray-600 mt-1">Anlık destek ekibi performansı</p>
        </div>
        <Badge variant={isConnected ? 'default' : 'destructive'}>
          {isConnected ? '🟢 Canlı' : '🔴 Bağlantı Yok'}
        </Badge>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Aktif Çağrılar</CardTitle>
            <Phone className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{realTimeData?.queue.active_calls || 0}</div>
            <p className="text-xs text-gray-500 mt-1">
              Kuyrukta: {realTimeData?.queue.calls_in_queue || 0}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Müsait Ajanlar</CardTitle>
            <Users className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {realTimeData?.agents.available || 0}
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Toplam: {realTimeData?.agents.total || 0}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Çağrıda</CardTitle>
            <Activity className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {realTimeData?.agents.on_call || 0}
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Away: {realTimeData?.agents.away || 0} | Busy: {realTimeData?.agents.busy || 0}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">SLA Uyumluluğu</CardTitle>
            <Clock className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              {slaData?.sla?.compliance?.toFixed(1) || 0}%
            </div>
            <p className="text-xs text-gray-500 mt-1">
              {slaData?.metrics?.answered_calls || 0}/{slaData?.metrics?.total_calls || 0} çağrı
            </p>
          </CardContent>
        </Card>
      </div>

      {/* SLA Metrics Card */}
      <Card>
        <CardHeader>
          <CardTitle>SLA Metrikleri</CardTitle>
          <CardDescription>Bugünkü performans göstergeleri</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">Yanıt Oranı</span>
                <Badge
                  variant={
                    (slaData?.metrics?.answer_rate || 0) >= (slaData?.sla?.target || 0)
                      ? 'default'
                      : 'destructive'
                  }
                >
                  {slaData?.metrics?.answer_rate?.toFixed(1) || 0}%
                </Badge>
              </div>
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <span>Hedef: {slaData?.sla?.target || 0}%</span>
                {(slaData?.metrics?.answer_rate || 0) >= (slaData?.sla?.target || 0) ? (
                  <TrendingUp className="h-4 w-4 text-green-600" />
                ) : (
                  <TrendingDown className="h-4 w-4 text-red-600" />
                )}
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">Ortalama Süre</span>
                <Badge variant="default">
                  {slaData?.metrics?.average_duration?.toFixed(0) || 0}s
                </Badge>
              </div>
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <span>{slaData?.metrics?.answered_calls || 0} çağrı</span>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">Terk Oranı</span>
                <Badge variant="secondary">
                  {slaData?.metrics?.abandonment_rate?.toFixed(1) || 0}%
                </Badge>
              </div>
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <span>{slaData?.metrics?.missed_calls || 0} kaçırılan</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>


      {/* Active Calls and Agents Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Active Calls */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Aktif Çağrılar</CardTitle>
                <CardDescription>{activeCalls.length} devam eden görüşme</CardDescription>
              </div>
              <PhoneCall className="h-5 w-5 text-green-600 animate-pulse" />
            </div>
          </CardHeader>
          <CardContent>
            {activeCalls.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                Şu anda aktif çağrı yok
              </div>
            ) : (
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {activeCalls.map((call) => (
                  <div
                    key={call.id}
                    className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-200"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="h-3 w-3 bg-green-500 rounded-full animate-pulse" />
                      <div>
                        <div className="font-medium text-gray-900">
                          {call.caller_number}
                        </div>
                        <div className="text-sm text-gray-600">
                          Ajan {call.agent_ext} • {formatDistance(new Date(call.start_time), new Date(), { addSuffix: true, locale: tr })}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-medium text-gray-900">
                        {Math.floor(call.duration / 60)}:{(call.duration % 60).toString().padStart(2, '0')}
                      </div>
                      <div className="text-xs text-gray-500">{call.status}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Team Status */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Ekip Durumu</CardTitle>
                <CardDescription>{agents.length} ajan</CardDescription>
              </div>
              <Users className="h-5 w-5 text-blue-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {agents.map((agent) => {
                const statusColors: Record<string, string> = {
                  'available': 'bg-green-100 border-green-300 text-green-800',
                  'on_call': 'bg-blue-100 border-blue-300 text-blue-800',
                  'away': 'bg-yellow-100 border-yellow-300 text-yellow-800',
                  'busy': 'bg-red-100 border-red-300 text-red-800',
                };
                const statusLabels: Record<string, string> = {
                  'available': 'Müsait',
                  'on_call': 'Çağrıda',
                  'away': 'Uzakta',
                  'busy': 'Meşgul',
                };

                return (
                  <div
                    key={agent.extension}
                    className={`flex items-center justify-between p-3 rounded-lg border ${
                      statusColors[agent.status] || 'bg-gray-100 border-gray-300'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      {agent.is_logged_in ? (
                        agent.status === 'on_call' ? (
                          <Phone className="h-4 w-4 animate-pulse" />
                        ) : (
                          <Phone className="h-4 w-4" />
                        )
                      ) : (
                        <PhoneOff className="h-4 w-4 text-gray-400" />
                      )}
                      <div>
                        <div className="font-medium">{agent.name}</div>
                        <div className="text-xs">Ext: {agent.extension}</div>
                      </div>
                    </div>
                    <div className="text-sm font-medium">
                      {statusLabels[agent.status] || agent.status}
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Hourly Distribution Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Saatlik Dağılım</CardTitle>
          <CardDescription>Bugünkü çağrı dağılımı - Toplam: {hourlyData?.total_calls || 0} çağrı</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="hour" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="Çağrı Sayısı" fill="#3b82f6" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Quick Stats Footer */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <Timer className="h-8 w-8 text-purple-600" />
              <div>
                <div className="text-sm text-gray-600">Uzakta</div>
                <div className="text-2xl font-bold text-purple-600">
                  {realTimeData?.agents.away || 0}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <AlertCircle className="h-8 w-8 text-red-600" />
              <div>
                <div className="text-sm text-gray-600">Meşgul</div>
                <div className="text-2xl font-bold text-red-600">
                  {realTimeData?.agents.busy || 0}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <Clock className="h-8 w-8 text-orange-600" />
              <div>
                <div className="text-sm text-gray-600">En Uzun Bekleyen</div>
                <div className="text-2xl font-bold text-orange-600">
                  {realTimeData?.queue.longest_wait_seconds || 0}s
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <PhoneCall className="h-8 w-8 text-green-600" />
              <div>
                <div className="text-sm text-gray-600">Tepe Saat</div>
                <div className="text-2xl font-bold text-green-600">
                  {hourlyData?.peak_hour || 0}:00
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

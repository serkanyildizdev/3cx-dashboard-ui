'use client';

import { useEffect, useState } from 'react';
import { Activity, Phone, Users, Clock, TrendingUp, TrendingDown } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { dashboardAPI, RealTimeStatus, SLAMetrics, HourlyDistribution } from '@/lib/api';
import { useWebSocket } from '@/hooks/useWebSocket';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { formatDistance } from 'date-fns';
import { tr } from 'date-fns/locale';

export default function HomePage() {
  const [realTimeData, setRealTimeData] = useState<RealTimeStatus | null>(null);
  const [slaData, setSlaData] = useState<SLAMetrics | null>(null);
  const [hourlyData, setHourlyData] = useState<HourlyDistribution | null>(null);
  const [loading, setLoading] = useState(true);
  const { isConnected, lastMessage } = useWebSocket();

  // Fetch initial data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [realTimeRes, slaRes, hourlyRes] = await Promise.all([
          dashboardAPI.getRealTimeStatus(),
          dashboardAPI.getSLAMetrics('today'),
          dashboardAPI.getHourlyDistribution('today'),
        ]);

        if (realTimeRes.data.data) setRealTimeData(realTimeRes.data.data);
        if (slaRes.data.data) setSlaData(slaRes.data.data);
        if (hourlyRes.data.data) setHourlyData(hourlyRes.data.data);
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();

    // Refresh every 30 seconds
    const interval = setInterval(fetchData, 30000);
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
              Müsait Değil: {realTimeData?.agents.unavailable || 0}
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
              {slaData?.sla_compliance.toFixed(1) || 0}%
            </div>
            <p className="text-xs text-gray-500 mt-1">
              {slaData?.calls_within_sla || 0}/{slaData?.total_calls || 0} çağrı
            </p>
          </CardContent>
        </Card>
      </div>

      {/* SLA Metrics Card */}
      <Card>
        <CardHeader>
          <CardTitle>SLA Metrikleri</CardTitle>
          <CardDescription>Bugünkü hedef karşılaştırması</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">Yanıt Oranı</span>
                <Badge
                  variant={
                    (slaData?.current_answer_rate || 0) >= (slaData?.target_answer_rate || 0)
                      ? 'default'
                      : 'destructive'
                  }
                >
                  {slaData?.current_answer_rate.toFixed(1)}%
                </Badge>
              </div>
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <span>Hedef: {slaData?.target_answer_rate.toFixed(1)}%</span>
                {(slaData?.current_answer_rate || 0) >= (slaData?.target_answer_rate || 0) ? (
                  <TrendingUp className="h-4 w-4 text-green-600" />
                ) : (
                  <TrendingDown className="h-4 w-4 text-red-600" />
                )}
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">Ortalama Süre</span>
                <Badge
                  variant={
                    (slaData?.current_avg_duration || 0) <= (slaData?.target_avg_duration || 0)
                      ? 'default'
                      : 'destructive'
                  }
                >
                  {slaData?.current_avg_duration.toFixed(0)}s
                </Badge>
              </div>
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <span>Hedef: {slaData?.target_avg_duration.toFixed(0)}s</span>
                {(slaData?.current_avg_duration || 0) <= (slaData?.target_avg_duration || 0) ? (
                  <TrendingUp className="h-4 w-4 text-green-600" />
                ) : (
                  <TrendingDown className="h-4 w-4 text-red-600" />
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Active Calls */}
      {realTimeData && realTimeData.active_calls && realTimeData.active_calls.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Aktif Çağrılar</CardTitle>
            <CardDescription>{realTimeData.active_calls.length} devam eden görüşme</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {realTimeData.active_calls.map((call) => (
                <div
                  key={call.call_id}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                >
                  <div className="flex items-center space-x-3">
                    <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse" />
                    <div>
                      <p className="font-medium text-sm">{call.agent_name}</p>
                      <p className="text-xs text-gray-500">{call.caller_number}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium">
                      {formatDistance(new Date(call.start_time), new Date(), {
                        addSuffix: false,
                        locale: tr,
                      })}
                    </p>
                    <p className="text-xs text-gray-500">
                      {Math.floor(call.duration / 60)}:{(call.duration % 60).toString().padStart(2, '0')}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Hourly Distribution Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Saatlik Dağılım</CardTitle>
          <CardDescription>Bugünkü çağrı dağılımı</CardDescription>
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
    </div>
  );
}

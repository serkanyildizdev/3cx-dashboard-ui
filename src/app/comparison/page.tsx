'use client';

import { useEffect, useState } from 'react';
import { ArrowUp, ArrowDown, Minus } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { compareAPI, ComparisonData } from '@/lib/api';
import { Skeleton } from '@/components/ui/skeleton';

export default function ComparisonPage() {
  const [weeklyData, setWeeklyData] = useState<ComparisonData | null>(null);
  const [monthlyData, setMonthlyData] = useState<ComparisonData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [weeklyRes, monthlyRes] = await Promise.all([
          compareAPI.getWeekly(),
          compareAPI.getMonthly(),
        ]);

        if (weeklyRes.data.data) setWeeklyData(weeklyRes.data.data);
        if (monthlyRes.data.data) setMonthlyData(monthlyRes.data.data);
      } catch (error) {
        console.error('Failed to fetch comparison data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const renderComparison = (data: ComparisonData | null) => {
    if (!data) return null;

    const getTrendIcon = (change: string) => {
      if (change.startsWith('+')) return <ArrowUp className="h-4 w-4 text-green-600" />;
      if (change.startsWith('-')) return <ArrowDown className="h-4 w-4 text-red-600" />;
      return <Minus className="h-4 w-4 text-gray-600" />;
    };

    const getTrendColor = (change: string) => {
      if (change.startsWith('+')) return 'text-green-600';
      if (change.startsWith('-')) return 'text-red-600';
      return 'text-gray-600';
    };

    const currentPeriod = data.current_week || data.current_month;
    const previousPeriod = data.previous_week || data.previous_month;

    return (
      <div className="space-y-6">
        <div className="flex items-center justify-center p-6 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg">
          <p className="text-lg font-medium text-gray-900">{data.comparison.summary}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Mevcut Dönem</CardTitle>
              <CardDescription>
                {new Date(currentPeriod?.period_start || '').toLocaleDateString('tr-TR')} -{' '}
                {new Date(currentPeriod?.period_end || '').toLocaleDateString('tr-TR')}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Toplam Çağrı</span>
                <span className="text-xl font-bold">{currentPeriod?.total_calls || 0}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Cevaplanan</span>
                <span className="text-xl font-bold text-green-600">{currentPeriod?.answered_calls || 0}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Kaçırılan</span>
                <span className="text-xl font-bold text-red-600">{currentPeriod?.missed_calls || 0}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Ort. Süre</span>
                <span className="text-xl font-bold">{currentPeriod?.average_duration.toFixed(0) || 0}s</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Benzersiz Arayan</span>
                <span className="text-xl font-bold">{currentPeriod?.unique_callers || 0}</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Önceki Dönem</CardTitle>
              <CardDescription>
                {new Date(previousPeriod?.period_start || '').toLocaleDateString('tr-TR')} -{' '}
                {new Date(previousPeriod?.period_end || '').toLocaleDateString('tr-TR')}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Toplam Çağrı</span>
                <span className="text-xl font-bold">{previousPeriod?.total_calls || 0}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Cevaplanan</span>
                <span className="text-xl font-bold text-green-600">{previousPeriod?.answered_calls || 0}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Kaçırılan</span>
                <span className="text-xl font-bold text-red-600">{previousPeriod?.missed_calls || 0}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Ort. Süre</span>
                <span className="text-xl font-bold">{previousPeriod?.average_duration.toFixed(0) || 0}s</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Benzersiz Arayan</span>
                <span className="text-xl font-bold">{previousPeriod?.unique_callers || 0}</span>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Değişim Analizi</CardTitle>
            <CardDescription>Önceki döneme göre yüzdelik değişim</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <div className="flex flex-col items-center p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-1 mb-2">
                  {getTrendIcon(data.comparison.calls_change)}
                  <span className={`text-lg font-bold ${getTrendColor(data.comparison.calls_change)}`}>
                    {data.comparison.calls_change}
                  </span>
                </div>
                <span className="text-xs text-gray-600">Toplam Çağrı</span>
              </div>

              <div className="flex flex-col items-center p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-1 mb-2">
                  {getTrendIcon(data.comparison.answered_change)}
                  <span className={`text-lg font-bold ${getTrendColor(data.comparison.answered_change)}`}>
                    {data.comparison.answered_change}
                  </span>
                </div>
                <span className="text-xs text-gray-600">Cevaplanan</span>
              </div>

              <div className="flex flex-col items-center p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-1 mb-2">
                  {getTrendIcon(data.comparison.missed_change)}
                  <span className={`text-lg font-bold ${getTrendColor(data.comparison.missed_change)}`}>
                    {data.comparison.missed_change}
                  </span>
                </div>
                <span className="text-xs text-gray-600">Kaçırılan</span>
              </div>

              <div className="flex flex-col items-center p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-1 mb-2">
                  {getTrendIcon(data.comparison.duration_change)}
                  <span className={`text-lg font-bold ${getTrendColor(data.comparison.duration_change)}`}>
                    {data.comparison.duration_change}
                  </span>
                </div>
                <span className="text-xs text-gray-600">Ort. Süre</span>
              </div>

              <div className="flex flex-col items-center p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-1 mb-2">
                  {getTrendIcon(data.comparison.callers_change)}
                  <span className={`text-lg font-bold ${getTrendColor(data.comparison.callers_change)}`}>
                    {data.comparison.callers_change}
                  </span>
                </div>
                <span className="text-xs text-gray-600">Benzersiz Arayan</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-gray-900">Performans Karşılaştırma</h1>
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Performans Karşılaştırma</h1>
        <p className="text-gray-600 mt-1">Dönemler arası performans analizi</p>
      </div>

      <Tabs defaultValue="weekly" className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="weekly">Haftalık</TabsTrigger>
          <TabsTrigger value="monthly">Aylık</TabsTrigger>
        </TabsList>

        <TabsContent value="weekly" className="mt-6">
          {renderComparison(weeklyData)}
        </TabsContent>

        <TabsContent value="monthly" className="mt-6">
          {renderComparison(monthlyData)}
        </TabsContent>
      </Tabs>
    </div>
  );
}

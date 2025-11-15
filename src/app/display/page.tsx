'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  dashboardAPI,
  statsAPI,
  compareAPI,
  RealTimeStatus,
  LeaderboardEntry,
  ComparisonData
} from '@/lib/api';
import { useWebSocket } from '@/hooks/useWebSocket';
import { Trophy, TrendingUp, TrendingDown, Phone, Users, Clock, Award } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

export default function DisplayPage() {
  const { t, language } = useLanguage();
  const [realTimeData, setRealTimeData] = useState<RealTimeStatus | null>(null);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [comparison, setComparison] = useState<ComparisonData | null>(null);
  const [todayStats, setTodayStats] = useState<any>(null);
  const { isConnected, lastMessage } = useWebSocket();
  const [currentTime, setCurrentTime] = useState(new Date());

  // Update time every second
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Fetch data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [realTimeRes, leaderboardRes, comparisonRes, queueStatsRes] = await Promise.all([
          dashboardAPI.getRealTimeStatus(),
          dashboardAPI.getLeaderboard('today', 5),
          compareAPI.getWeekly(),
          statsAPI.getQueueStats('today'),
        ]);

        if (realTimeRes.data.data) setRealTimeData(realTimeRes.data.data);
        if (leaderboardRes.data.data?.leaderboard) setLeaderboard(leaderboardRes.data.data.leaderboard);
        if (comparisonRes.data.data) setComparison(comparisonRes.data.data);
        if (queueStatsRes.data.data) setTodayStats(queueStatsRes.data.data.statistics);
      } catch (error) {
        console.error('Failed to fetch display data:', error);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 1000); // Refresh every 1 second for real-time monitoring
    return () => clearInterval(interval);
  }, []);

  // Handle WebSocket updates - refresh data when call events occur
  useEffect(() => {
    if (lastMessage && lastMessage.type !== 'welcome' && lastMessage.type !== 'ping') {
      // Only refresh on actual call events (call_started, call_answered, call_ended, call_ringing)
      Promise.all([
        dashboardAPI.getRealTimeStatus(),
        statsAPI.getQueueStats('today'),
      ]).then(([realTimeRes, queueStatsRes]) => {
        if (realTimeRes.data.data) setRealTimeData(realTimeRes.data.data);
        if (queueStatsRes.data.data) setTodayStats(queueStatsRes.data.data.statistics);
      }).catch(err => console.error('Failed to refresh on WebSocket event:', err));
    }
  }, [lastMessage]);

  // Get top performer
  const topPerformer = leaderboard[0];
  const yesterday = comparison?.previous_week;
  const today = comparison?.current_week;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900 p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center space-x-6">
          <Image
            src="/logo.png"
            alt="Spiegel21 Logo"
            width={240}
            height={80}
            className="object-contain"
            priority
          />
          <div>
            <h1 className="text-5xl font-bold text-white mb-2">
              {t.display.title}
            </h1>
            <p className="text-2xl text-blue-200">{t.display.subtitle}</p>
          </div>
        </div>
        <div className="text-right">
          <div className="text-5xl font-bold text-white">
            {currentTime.toLocaleTimeString(language === 'tr' ? 'tr-TR' : language === 'de' ? 'de-DE' : 'en-US', { hour: '2-digit', minute: '2-digit' })}
          </div>
          <div className="text-xl text-blue-200 mt-2">
            {currentTime.toLocaleDateString(language === 'tr' ? 'tr-TR' : language === 'de' ? 'de-DE' : 'en-US', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}
          </div>
          <Badge
            variant={isConnected ? 'default' : 'destructive'}
            className="mt-3 text-lg px-4 py-2"
          >
            {isConnected ? `🟢 ${t.display.live}` : `🔴 ${t.display.disconnected}`}
          </Badge>
        </div>
      </div>

      {/* Main Stats Grid */}
      <div className="grid grid-cols-4 gap-6 mb-8">
        {/* Active Calls */}
        <Card className="bg-gradient-to-br from-blue-500 to-blue-700 border-0 shadow-2xl">
          <CardContent className="p-8">
            <div className="flex items-center justify-between mb-4">
              <Phone className="h-12 w-12 text-white opacity-80" />
              <div className="h-4 w-4 bg-green-400 rounded-full animate-pulse" />
            </div>
            <div className="text-7xl font-bold text-white mb-2">
              {realTimeData?.queue.active_calls || 0}
            </div>
            <div className="text-xl text-blue-100">{t.display.activeCalls}</div>
            <div className="text-lg text-blue-200 mt-2">
              {t.display.inQueue}: {realTimeData?.queue.calls_in_queue || 0}
            </div>
          </CardContent>
        </Card>

        {/* Available Agents */}
        <Card className="bg-gradient-to-br from-green-500 to-green-700 border-0 shadow-2xl">
          <CardContent className="p-8">
            <div className="flex items-center justify-between mb-4">
              <Users className="h-12 w-12 text-white opacity-80" />
            </div>
            <div className="text-7xl font-bold text-white mb-2">
              {realTimeData?.agents.available || 0}
            </div>
            <div className="text-xl text-green-100">{t.display.availableAgents}</div>
            <div className="text-lg text-green-200 mt-2">
              {t.common.total}: {realTimeData?.agents.total || 0}
            </div>
          </CardContent>
        </Card>

        {/* Today's Calls */}
        <Card className="bg-gradient-to-br from-purple-500 to-purple-700 border-0 shadow-2xl">
          <CardContent className="p-8">
            <div className="flex items-center justify-between mb-4">
              <Phone className="h-12 w-12 text-white opacity-80" />
              {todayStats && yesterday && (
                <div className="flex items-center text-white">
                  {todayStats.total_calls >= (yesterday.total_calls || 0) ? (
                    <TrendingUp className="h-8 w-8" />
                  ) : (
                    <TrendingDown className="h-8 w-8" />
                  )}
                </div>
              )}
            </div>
            <div className="text-7xl font-bold text-white mb-2">
              {todayStats?.total_calls || 0}
            </div>
            <div className="text-xl text-purple-100">{t.display.todaysCalls}</div>
            <div className="text-lg text-purple-200 mt-2">
              {t.display.yesterday}: {yesterday?.total_calls || 0}
            </div>
          </CardContent>
        </Card>

        {/* Answer Rate */}
        <Card className="bg-gradient-to-br from-orange-500 to-orange-700 border-0 shadow-2xl">
          <CardContent className="p-8">
            <div className="flex items-center justify-between mb-4">
              <Clock className="h-12 w-12 text-white opacity-80" />
            </div>
            <div className="text-7xl font-bold text-white mb-2">
              {todayStats ? ((todayStats.answered_calls / (todayStats.total_calls || 1)) * 100).toFixed(0) : 0}%
            </div>
            <div className="text-xl text-orange-100">{t.display.answerRate}</div>
            <div className="text-lg text-orange-200 mt-2">
              {todayStats?.answered_calls || 0}/{todayStats?.total_calls || 0} {t.display.answered}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Secondary Stats */}
      <div className="grid grid-cols-3 gap-6 mb-8">
        <Card className="bg-white/10 backdrop-blur-lg border-white/20 shadow-xl">
          <CardContent className="p-6">
            <div className="text-3xl font-bold text-white mb-2">
              {realTimeData?.agents.on_call || 0}
            </div>
            <div className="text-lg text-blue-200">{t.display.onCall}</div>
          </CardContent>
        </Card>

        <Card className="bg-white/10 backdrop-blur-lg border-white/20 shadow-xl">
          <CardContent className="p-6">
            <div className="text-3xl font-bold text-white mb-2">
              {todayStats?.missed_calls || 0}
            </div>
            <div className="text-lg text-blue-200">{t.statistics.missed}</div>
          </CardContent>
        </Card>

        <Card className="bg-white/10 backdrop-blur-lg border-white/20 shadow-xl">
          <CardContent className="p-6">
            <div className="text-3xl font-bold text-white mb-2">
              {todayStats?.average_duration ? Math.floor(todayStats.average_duration / 60) : 0}:{todayStats?.average_duration ? (todayStats.average_duration % 60).toString().padStart(2, '0') : '00'}
            </div>
            <div className="text-lg text-blue-200">{t.display.avgCallDuration}</div>
          </CardContent>
        </Card>
      </div>

      {/* Bottom Section: Top Performer & Leaderboard */}
      <div className="grid grid-cols-2 gap-6">
        {/* Top Performer */}
        {topPerformer && (
          <Card className="bg-gradient-to-br from-yellow-400 via-yellow-500 to-yellow-600 border-0 shadow-2xl">
            <CardContent className="p-8">
              <div className="flex items-center space-x-4 mb-6">
                <Trophy className="h-16 w-16 text-yellow-900" />
                <div>
                  <div className="text-2xl text-yellow-900 font-medium">{t.display.topPerformer}</div>
                  <div className="text-sm text-yellow-800">{t.display.topPerformerSubtitle}</div>
                </div>
              </div>

              <div className="text-6xl font-bold text-yellow-900 mb-4">
                {topPerformer.agent_name}
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <div className="text-4xl font-bold text-yellow-900">
                    {topPerformer.total_calls}
                  </div>
                  <div className="text-lg text-yellow-800">{t.display.calls}</div>
                </div>
                <div>
                  <div className="text-4xl font-bold text-yellow-900">
                    {Math.floor(topPerformer.total_duration / 60)}{language === 'tr' ? 'dk' : 'min'}
                  </div>
                  <div className="text-lg text-yellow-800">{t.common.total}</div>
                </div>
                <div>
                  <div className="text-4xl font-bold text-yellow-900">
                    {topPerformer.answer_rate.toFixed(0)}%
                  </div>
                  <div className="text-lg text-yellow-800">{t.display.answer}</div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Leaderboard */}
        <Card className="bg-white/10 backdrop-blur-lg border-white/20 shadow-2xl">
          <CardContent className="p-8">
            <div className="flex items-center space-x-3 mb-6">
              <Award className="h-12 w-12 text-blue-300" />
              <div className="text-3xl font-bold text-white">{t.leaderboard.title}</div>
            </div>

            <div className="space-y-4">
              {leaderboard && leaderboard.length > 0 ? (
                leaderboard.slice(0, 5).map((entry, index) => (
                  <div
                    key={entry.agent_ext}
                    className={`flex items-center justify-between p-4 rounded-lg ${
                      index === 0
                        ? 'bg-yellow-500/30 border-2 border-yellow-400'
                        : 'bg-white/5'
                    }`}
                  >
                    <div className="flex items-center space-x-4">
                      <div className={`text-3xl font-bold ${
                        index === 0 ? 'text-yellow-300' :
                        index === 1 ? 'text-gray-300' :
                        index === 2 ? 'text-orange-300' :
                        'text-blue-200'
                      }`}>
                        #{entry.rank}
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-white">
                          {entry.agent_name}
                        </div>
                        <div className="text-lg text-blue-200">
                          {entry.total_calls} {t.display.calls} • {Math.floor(entry.total_duration / 60)}{language === 'tr' ? 'dk' : 'min'}
                        </div>
                      </div>
                    </div>
                    <div className="text-3xl font-bold text-white">
                      {entry.answer_rate.toFixed(0)}%
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-white/60">
                  <div className="text-2xl mb-2">📊</div>
                  <div className="text-xl">{language === 'tr' ? 'Henüz veri yok' : language === 'de' ? 'Noch keine Daten' : 'No data yet'}</div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

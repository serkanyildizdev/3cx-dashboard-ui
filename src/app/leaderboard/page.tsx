'use client';

import { useEffect, useState } from 'react';
import { Trophy, Medal, Award } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { dashboardAPI, LeaderboardEntry, LeaderboardResponse } from '@/lib/api';
import { Skeleton } from '@/components/ui/skeleton';
import { useLanguage } from '@/contexts/LanguageContext';

export default function LeaderboardPage() {
  const { t } = useLanguage();
  const [data, setData] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await dashboardAPI.getLeaderboard('today', 20);
        if (res.data.data?.leaderboard) {
          setData(res.data.data.leaderboard);
        }
      } catch (error) {
        console.error('Failed to fetch leaderboard:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
    const interval = setInterval(fetchData, 60000);
    return () => clearInterval(interval);
  }, []);

  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Trophy className="h-6 w-6 text-yellow-500" />;
    if (rank === 2) return <Medal className="h-6 w-6 text-gray-400" />;
    if (rank === 3) return <Award className="h-6 w-6 text-orange-600" />;
    return null;
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-gray-900">{t.leaderboard.title}</h1>
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">{t.leaderboard.title}</h1>
        <p className="text-gray-600 mt-1">{t.leaderboard.subtitle}</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t.leaderboard.todayRanking}</CardTitle>
          <CardDescription>
            {data.length > 0 ? `${data.length} ${t.leaderboard.ranked}` : t.leaderboard.noDataYet}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {data.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              {t.leaderboard.noDataYet}
            </div>
          ) : (
            <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-16">{t.leaderboard.rank}</TableHead>
                <TableHead>{t.leaderboard.agent}</TableHead>
                <TableHead className="text-right">{t.leaderboard.totalCalls}</TableHead>
                <TableHead className="text-right">{t.leaderboard.answeredCalls}</TableHead>
                <TableHead className="text-right">{t.leaderboard.answerRate}</TableHead>
                <TableHead className="text-right">{t.leaderboard.avgDuration}</TableHead>
                <TableHead className="text-right">{t.leaderboard.totalDuration}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.map((entry) => (
                <TableRow key={entry.agent_ext}>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      {getRankIcon(entry.rank)}
                      <span className="font-bold">{entry.rank}</span>
                    </div>
                  </TableCell>
                  <TableCell className="font-medium">{entry.agent_name}</TableCell>
                  <TableCell className="text-right">{entry.total_calls}</TableCell>
                  <TableCell className="text-right text-green-600 font-medium">
                    {entry.answered_calls}
                  </TableCell>
                  <TableCell className="text-right">
                    <Badge variant={entry.answer_rate >= 90 ? 'default' : 'secondary'}>
                      {entry.answer_rate.toFixed(1)}%
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">{entry.average_duration.toFixed(0)}s</TableCell>
                  <TableCell className="text-right">
                    {Math.floor(entry.total_duration / 60)}:{(entry.total_duration % 60).toString().padStart(2, '0')}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

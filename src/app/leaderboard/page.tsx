'use client';

import { useEffect, useState } from 'react';
import { Trophy, Medal, Award } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { dashboardAPI, LeaderboardEntry } from '@/lib/api';
import { Skeleton } from '@/components/ui/skeleton';

export default function LeaderboardPage() {
  const [data, setData] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await dashboardAPI.getLeaderboard('today', 20);
        if (res.data.data) setData(res.data.data);
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
        <h1 className="text-3xl font-bold text-gray-900">Liderlik Tablosu</h1>
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Liderlik Tablosu</h1>
        <p className="text-gray-600 mt-1">En iyi performans gösteren ajanlar</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Bugünkü Performans Sıralaması</CardTitle>
          <CardDescription>Yanıt oranı ve çağrı sayısına göre</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-16">Sıra</TableHead>
                <TableHead>Ajan</TableHead>
                <TableHead className="text-right">Toplam Çağrı</TableHead>
                <TableHead className="text-right">Cevaplanan</TableHead>
                <TableHead className="text-right">Yanıt Oranı</TableHead>
                <TableHead className="text-right">Ort. Süre</TableHead>
                <TableHead className="text-right">Toplam Süre</TableHead>
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
        </CardContent>
      </Card>
    </div>
  );
}

'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { callsAPI, Call } from '@/lib/api';
import { Skeleton } from '@/components/ui/skeleton';
import { Phone } from 'lucide-react';
import { formatDistance } from 'date-fns';
import { tr } from 'date-fns/locale';

export default function CallsPage() {
  const [calls, setCalls] = useState<Call[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await callsAPI.getActive();
        if (res.data.data?.calls) {
          setCalls(res.data.data.calls);
        } else {
          setCalls([]);
        }
      } catch (error) {
        console.error('Failed to fetch calls:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
    const interval = setInterval(fetchData, 5000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-gray-900">Aktif Çağrılar</h1>
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Aktif Çağrılar</h1>
        <p className="text-gray-600 mt-1">{calls.length} devam eden görüşme</p>
      </div>

      {calls.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Phone className="h-12 w-12 text-gray-400 mb-4" />
            <p className="text-gray-600">Şu anda aktif çağrı bulunmamaktadır</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {calls.map((call) => (
            <Card key={call.id}>
              <CardHeader>
                <div className="flex items-center space-x-2">
                  <div className="h-3 w-3 bg-green-500 rounded-full animate-pulse" />
                  <CardTitle className="text-lg">Ajan {call.agent_ext}</CardTitle>
                </div>
                <CardDescription>{call.caller_number}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Kuyruk</span>
                    <span className="text-sm font-medium">{call.queue_number}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Süre</span>
                    <span className="text-sm font-medium">
                      {Math.floor(call.duration / 60)}:{(call.duration % 60).toString().padStart(2, '0')}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Başlangıç</span>
                    <span className="text-sm font-medium">
                      {formatDistance(new Date(call.start_time), new Date(), { addSuffix: true, locale: tr })}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Durum</span>
                    <span className="text-sm font-medium">{call.status}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

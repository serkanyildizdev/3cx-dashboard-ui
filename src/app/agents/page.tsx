'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { agentsAPI, Agent } from '@/lib/api';
import { Skeleton } from '@/components/ui/skeleton';
import { Phone, PhoneOff } from 'lucide-react';

export default function AgentsPage() {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await agentsAPI.getAll();
        if (res.data.data) setAgents(res.data.data);
      } catch (error) {
        console.error('Failed to fetch agents:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, []);

  const getStatusBadge = (status: string) => {
    const variants: Record<string, any> = {
      'Available': 'default',
      'On Call': 'secondary',
      'Away': 'outline',
      'Busy': 'destructive',
    };
    return <Badge variant={variants[status] || 'outline'}>{status}</Badge>;
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-gray-900">Ajanlar</h1>
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Destek Ekibi</h1>
        <p className="text-gray-600 mt-1">{agents.length} ajan</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {agents.map((agent) => (
          <Card key={agent.extension}>
            <CardHeader>
              <div className="flex items-center space-x-4">
                <Avatar>
                  <AvatarFallback>
                    {agent.first_name[0]}{agent.last_name[0]}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <CardTitle className="text-lg">
                    {agent.first_name} {agent.last_name}
                  </CardTitle>
                  <p className="text-sm text-gray-600">Ext: {agent.extension}</p>
                </div>
                {agent.current_call ? (
                  <Phone className="h-5 w-5 text-green-600 animate-pulse" />
                ) : (
                  <PhoneOff className="h-5 w-5 text-gray-400" />
                )}
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Durum</span>
                  {getStatusBadge(agent.status)}
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Email</span>
                  <span className="text-sm truncate max-w-[200px]">{agent.email}</span>
                </div>
                {agent.current_call && (
                  <div className="mt-3 p-3 bg-green-50 rounded-lg">
                    <p className="text-xs font-medium text-green-900">Aktif Çağrı</p>
                    <p className="text-sm text-green-700 mt-1">{agent.current_call.caller_number}</p>
                    <p className="text-xs text-green-600 mt-1">
                      {Math.floor(agent.current_call.duration / 60)}:
                      {(agent.current_call.duration % 60).toString().padStart(2, '0')}
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

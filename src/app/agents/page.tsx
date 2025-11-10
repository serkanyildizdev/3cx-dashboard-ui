'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { agentsAPI, Agent } from '@/lib/api';
import { Skeleton } from '@/components/ui/skeleton';
import { Phone, PhoneOff } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

export default function AgentsPage() {
  const { t } = useLanguage();
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await agentsAPI.getAll();
        if (res.data.data?.agents) {
          setAgents(res.data.data.agents);
        }
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
      'available': 'default',
      'on_call': 'secondary',
      'away': 'outline',
      'busy': 'destructive',
    };
    const statusLabels: Record<string, string> = {
      'available': t.agentStatus.available,
      'on_call': t.agentStatus.on_call,
      'away': t.agentStatus.away,
      'busy': t.agentStatus.busy,
    };
    return <Badge variant={variants[status] || 'outline'}>{statusLabels[status] || status}</Badge>;
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-gray-900">{t.agents.title}</h1>
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">{t.agents.title}</h1>
        <p className="text-gray-600 mt-1">{agents.length} {t.agents.subtitle}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {agents.map((agent) => {
          const nameParts = agent.name.split(' ');
          const initials = nameParts.length >= 2
            ? `${nameParts[0][0]}${nameParts[nameParts.length - 1][0]}`
            : agent.name.substring(0, 2);

          return (
            <Card key={agent.extension}>
              <CardHeader>
                <div className="flex items-center space-x-4">
                  <Avatar>
                    <AvatarFallback>
                      {initials.toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <CardTitle className="text-lg">
                      {agent.name}
                    </CardTitle>
                    <p className="text-sm text-gray-600">Ext: {agent.extension}</p>
                  </div>
                  {agent.is_logged_in ? (
                    agent.status === 'on_call' ? (
                      <Phone className="h-5 w-5 text-green-600 animate-pulse" />
                    ) : (
                      <Phone className="h-5 w-5 text-blue-600" />
                    )
                  ) : (
                    <PhoneOff className="h-5 w-5 text-gray-400" />
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">{t.agents.status}</span>
                    {getStatusBadge(agent.status)}
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">{t.agents.loginStatus}</span>
                    <Badge variant={agent.is_logged_in ? 'default' : 'outline'}>
                      {agent.is_logged_in ? t.agents.online : t.agents.offline}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">{t.agents.queue}</span>
                    <span className="text-sm font-medium">{agent.queue_number}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

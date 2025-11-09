import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api/v1';

export const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept-Language': 'tr', // Turkish by default
  },
});

// API Response type
export interface APIResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: string;
  };
}

// Agent types
export interface Agent {
  extension: string;
  first_name: string;
  last_name: string;
  email: string;
  status: string;
  current_call?: {
    caller_number: string;
    duration: number;
    start_time: string;
  };
}

// Call statistics types
export interface QueueStatistics {
  queue_number: string;
  total_calls: number;
  answered_calls: number;
  missed_calls: number;
  average_duration: number;
  unique_callers: number;
  active_agents: number;
  period_start: string;
  period_end: string;
}

export interface AgentCallStatistics {
  agent_ext: string;
  agent_name?: string;
  total_calls: number;
  answered_calls: number;
  missed_calls: number;
  average_duration: number;
  total_duration: number;
}

export interface Call {
  id: string;
  agent_ext: string;
  caller_number: string;
  queue_number: string;
  start_time: string;
  end_time?: string;
  duration: number;
  status: string;
}

// Dashboard types
export interface RealTimeStatus {
  queue: {
    calls_in_queue: number;
    longest_wait_seconds: number;
    active_calls: number;
  };
  agents: {
    total: number;
    available: number;
    on_call: number;
    unavailable: number;
  };
  active_calls: Array<{
    call_id: string;
    agent_ext: string;
    agent_name: string;
    caller_number: string;
    duration: number;
    start_time: string;
  }>;
}

export interface HourlyDistribution {
  hours: number[];
  calls: number[];
  answered: number[];
  missed: number[];
}

export interface LeaderboardEntry {
  rank: number;
  agent_ext: string;
  agent_name: string;
  total_calls: number;
  answered_calls: number;
  answer_rate: number;
  average_duration: number;
  total_duration: number;
}

export interface SLAMetrics {
  target_answer_rate: number;
  current_answer_rate: number;
  target_avg_duration: number;
  current_avg_duration: number;
  calls_within_sla: number;
  total_calls: number;
  sla_compliance: number;
  status: 'ok' | 'warning' | 'critical';
}

export interface ComparisonData {
  current_week?: QueueStatistics;
  previous_week?: QueueStatistics;
  current_month?: QueueStatistics;
  previous_month?: QueueStatistics;
  comparison: {
    calls_change: string;
    answered_change: string;
    missed_change: string;
    duration_change: string;
    callers_change: string;
    trend: 'improving' | 'declining' | 'stable';
    summary: string;
  };
  period_name: string;
}

// API functions
export const agentsAPI = {
  getAll: () => api.get<APIResponse<Agent[]>>('/agents'),
  getByExtension: (extension: string) => api.get<APIResponse<Agent>>(`/agents/${extension}`),
  getStatusSummary: () => api.get<APIResponse<any>>('/agents/status/summary'),
};

export const callsAPI = {
  getActive: () => api.get<APIResponse<Call[]>>('/calls/active'),
  getActiveCount: () => api.get<APIResponse<{ count: number }>>('/calls/active/count'),
};

export const statsAPI = {
  getQueueStats: (period: string = 'today') =>
    api.get<APIResponse<{ period: string; period_name: string; statistics: QueueStatistics }>>(`/stats/queue?period=${period}`),
  getAgentStats: (extension: string, period: string = 'today') =>
    api.get<APIResponse<{ period: string; period_name: string; extension: string; statistics: AgentCallStatistics }>>(`/stats/agent/${extension}?period=${period}`),
  getAllAgentsStats: (period: string = 'today') =>
    api.get<APIResponse<{ period: string; period_name: string; agents: AgentCallStatistics[]; total: number }>>(`/stats/agents?period=${period}`),
  getCallHistory: (period: string = 'today', limit: number = 100) =>
    api.get<APIResponse<{ period: string; period_name: string; calls: Call[]; total: number }>>(`/stats/history?period=${period}&limit=${limit}`),
};

export const dashboardAPI = {
  getRealTimeStatus: () => api.get<APIResponse<RealTimeStatus>>('/dashboard/realtime'),
  getHourlyDistribution: (period: string = 'today') =>
    api.get<APIResponse<HourlyDistribution>>(`/dashboard/hourly?period=${period}`),
  getLeaderboard: (period: string = 'today', limit: number = 10) =>
    api.get<APIResponse<LeaderboardEntry[]>>(`/dashboard/leaderboard?period=${period}&limit=${limit}`),
  getSLAMetrics: (period: string = 'today') =>
    api.get<APIResponse<SLAMetrics>>(`/dashboard/sla?period=${period}`),
};

export const compareAPI = {
  getWeekly: () => api.get<APIResponse<ComparisonData>>('/compare/weekly'),
  getMonthly: () => api.get<APIResponse<ComparisonData>>('/compare/monthly'),
};

// WebSocket Event types
export interface WebSocketMessage {
  type: 'welcome' | 'call_started' | 'call_answered' | 'call_ended' | 'call_ringing';
  data?: any;
}

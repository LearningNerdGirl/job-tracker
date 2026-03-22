'use client';

import { useQuery } from '@tanstack/react-query';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line, CartesianGrid, Cell } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import api from '@/lib/api';

const STATUS_COLORS: Record<string, string> = {
  WISHLIST: '#94a3b8',
  APPLIED: '#3b82f6',
  SCREENING: '#eab308',
  INTERVIEW: '#a855f7',
  OFFER: '#22c55e',
  REJECTED: '#ef4444',
};

const STATUS_LABELS: Record<string, string> = {
  WISHLIST: 'Wishlist', APPLIED: 'Applied', SCREENING: 'Screening',
  INTERVIEW: 'Interview', OFFER: 'Offer', REJECTED: 'Rejected',
};

export default function AnalyticsPage() {
  const { data: stats } = useQuery({
    queryKey: ['stats-summary'],
    queryFn: () => api.get('/stats/summary').then((r) => r.data.data),
  });

  const { data: timeline } = useQuery({
    queryKey: ['stats-timeline'],
    queryFn: () => api.get('/stats/timeline').then((r) => r.data.data),
  });

  const funnelData = ['APPLIED', 'SCREENING', 'INTERVIEW', 'OFFER'].map((s) => ({
    name: STATUS_LABELS[s],
    count: stats?.summary?.[s] ?? 0,
    color: STATUS_COLORS[s],
  }));

  const pipelineData = Object.entries(stats?.summary ?? {}).map(([key, val]) => ({
    name: STATUS_LABELS[key] ?? key,
    count: val as number,
    color: STATUS_COLORS[key] ?? '#94a3b8',
  }));

  const timelineChartData = (timeline ?? []).map((d: any) => ({
    date: new Date(d.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    applications: d.count,
  }));

  return (
    <div className="space-y-6 max-w-5xl">
      <div>
        <h1 className="text-2xl font-bold">Analytics</h1>
        <p className="text-muted-foreground text-sm">Insights from your job search data</p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Total', value: stats?.total ?? 0 },
          { label: 'Response Rate', value: `${stats?.responseRate ?? 0}%` },
          { label: 'In Progress', value: (stats?.summary?.SCREENING ?? 0) + (stats?.summary?.INTERVIEW ?? 0) },
          { label: 'Offers', value: stats?.summary?.OFFER ?? 0 },
        ].map(({ label, value }) => (
          <Card key={label}>
            <CardContent className="p-4 text-center">
              <p className="text-3xl font-bold">{value}</p>
              <p className="text-xs text-muted-foreground mt-1">{label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Pipeline Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={pipelineData} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                  {pipelineData.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Application Funnel</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 pt-2">
              {funnelData.map(({ name, count, color }, i) => {
                const max = funnelData[0]?.count || 1;
                const width = Math.max((count / max) * 100, count > 0 ? 10 : 0);
                return (
                  <div key={name} className="space-y-1">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground font-medium">{name}</span>
                      <span className="font-bold">{count}</span>
                    </div>
                    <div className="h-7 bg-muted rounded-md overflow-hidden">
                      <div
                        className="h-full rounded-md flex items-center px-2 text-xs text-white font-medium transition-all duration-500"
                        style={{ width: `${width}%`, backgroundColor: color, minWidth: count > 0 ? '2rem' : '0' }}
                      >
                        {count > 0 && `${Math.round((count / (stats?.total || 1)) * 100)}%`}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Applications Over Time (Last 30 Days)</CardTitle>
          </CardHeader>
          <CardContent>
            {timelineChartData.length === 0 ? (
              <div className="flex items-center justify-center h-[180px] text-muted-foreground text-sm">
                No data for the last 30 days
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={180}>
                <LineChart data={timelineChartData} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                  <Tooltip />
                  <Line type="monotone" dataKey="applications" stroke="#3b82f6" strokeWidth={2} dot={{ r: 3 }} activeDot={{ r: 5 }} />
                </LineChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

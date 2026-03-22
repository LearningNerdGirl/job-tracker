'use client';

import { useQuery } from '@tanstack/react-query';
import { Briefcase, TrendingUp, Calendar, Target, Clock, ExternalLink } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatDate } from '@/lib/utils';
import { useAuthStore } from '@/store/authStore';
import api from '@/lib/api';
import Link from 'next/link';

const STATUS_CONFIG: Record<string, { label: string; variant: any; color: string }> = {
  WISHLIST: { label: 'Wishlist', variant: 'gray', color: 'bg-gray-500' },
  APPLIED: { label: 'Applied', variant: 'blue', color: 'bg-blue-500' },
  SCREENING: { label: 'Screening', variant: 'warning', color: 'bg-yellow-500' },
  INTERVIEW: { label: 'Interview', variant: 'purple', color: 'bg-purple-500' },
  OFFER: { label: 'Offer', variant: 'success', color: 'bg-green-500' },
  REJECTED: { label: 'Rejected', variant: 'destructive', color: 'bg-red-500' },
};

export default function DashboardPage() {
  const { user } = useAuthStore();

  const { data: stats } = useQuery({
    queryKey: ['stats-summary'],
    queryFn: () => api.get('/stats/summary').then((r) => r.data.data),
  });

  const { data: followUps } = useQuery({
    queryKey: ['followups'],
    queryFn: () => api.get('/stats/followups').then((r) => r.data.data),
  });

  const { data: recent } = useQuery({
    queryKey: ['recent-applications'],
    queryFn: () => api.get('/applications?limit=5').then((r) => r.data.data),
  });

  const statCards = [
    { label: 'Total Applications', value: stats?.total ?? 0, icon: Briefcase, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'Response Rate', value: `${stats?.responseRate ?? 0}%`, icon: TrendingUp, color: 'text-green-600', bg: 'bg-green-50' },
    { label: 'In Interview', value: stats?.summary?.INTERVIEW ?? 0, icon: Target, color: 'text-purple-600', bg: 'bg-purple-50' },
    { label: 'Offers Received', value: stats?.summary?.OFFER ?? 0, icon: Calendar, color: 'text-orange-600', bg: 'bg-orange-50' },
  ];

  return (
    <div className="space-y-6 max-w-6xl">
      <div>
        <h1 className="text-2xl font-bold">Good morning, {user?.name?.split(' ')[0]} 👋</h1>
        <p className="text-muted-foreground text-sm mt-0.5">Here&apos;s your job search at a glance</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map(({ label, value, icon: Icon, color, bg }) => (
          <Card key={label}>
            <CardContent className="flex items-center gap-3 p-4">
              <div className={`${bg} ${color} p-2.5 rounded-lg shrink-0`}>
                <Icon className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <p className="text-2xl font-bold">{value}</p>
                <p className="text-xs text-muted-foreground truncate">{label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-1">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-primary" />
              Pipeline Status
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {Object.entries(STATUS_CONFIG).map(([key, { label, color }]) => (
              <div key={key} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <div className={`h-2 w-2 rounded-full ${color}`} />
                  <span className="text-muted-foreground">{label}</span>
                </div>
                <span className="font-semibold">{stats?.summary?.[key] ?? 0}</span>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-semibold">Recent Applications</CardTitle>
              <Link href="/applications" className="text-xs text-primary hover:underline">View all</Link>
            </div>
          </CardHeader>
          <CardContent className="space-y-2">
            {!recent?.length ? (
              <div className="text-center py-6 text-muted-foreground text-sm">
                <Briefcase className="h-8 w-8 mx-auto mb-2 opacity-30" />
                No applications yet. <Link href="/applications" className="text-primary hover:underline">Add your first one</Link>
              </div>
            ) : recent.map((app: any) => (
              <div key={app.id} className="flex items-center justify-between p-2.5 rounded-md hover:bg-muted/50 transition-colors">
                <div className="min-w-0">
                  <p className="font-medium text-sm truncate">{app.company}</p>
                  <p className="text-xs text-muted-foreground truncate">{app.role}</p>
                </div>
                <Badge variant={STATUS_CONFIG[app.status]?.variant}>{STATUS_CONFIG[app.status]?.label}</Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {followUps && followUps.length > 0 && (
        <Card className="border-orange-200 bg-orange-50/50">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold flex items-center gap-2 text-orange-700">
              <Clock className="h-4 w-4" />Follow-up Reminders ({followUps.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {followUps.map((app: any) => (
              <div key={app.id} className="flex items-center justify-between text-sm">
                <div>
                  <span className="font-medium">{app.company}</span>
                  <span className="text-muted-foreground"> · {app.role}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-orange-600 font-medium">{formatDate(app.followUpDate)}</span>
                  <Link href={`/applications`}><ExternalLink className="h-3 w-3 text-muted-foreground" /></Link>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}

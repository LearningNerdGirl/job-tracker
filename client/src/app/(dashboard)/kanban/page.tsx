'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, ExternalLink, Briefcase } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { formatDate } from '@/lib/utils';
import api from '@/lib/api';
import Link from 'next/link';
import { toast } from '@/hooks/use-toast';

const COLUMNS = [
  { key: 'WISHLIST', label: 'Wishlist', variant: 'gray' as const, color: 'border-gray-300 bg-gray-50' },
  { key: 'APPLIED', label: 'Applied', variant: 'blue' as const, color: 'border-blue-300 bg-blue-50' },
  { key: 'SCREENING', label: 'Screening', variant: 'warning' as const, color: 'border-yellow-300 bg-yellow-50' },
  { key: 'INTERVIEW', label: 'Interview', variant: 'purple' as const, color: 'border-purple-300 bg-purple-50' },
  { key: 'OFFER', label: 'Offer', variant: 'success' as const, color: 'border-green-300 bg-green-50' },
  { key: 'REJECTED', label: 'Rejected', variant: 'destructive' as const, color: 'border-red-300 bg-red-50' },
];

export default function KanbanPage() {
  const qc = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['applications-all'],
    queryFn: () => api.get('/applications?limit=200').then((r) => r.data.data),
  });

  const statusMutation = useMutation({
    mutationFn: ({ id, status }: { id: number; status: string }) =>
      api.patch(`/applications/${id}/status`, { status }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['applications-all'] });
      qc.invalidateQueries({ queryKey: ['applications'] });
      qc.invalidateQueries({ queryKey: ['stats-summary'] });
    },
    onError: () => toast({ title: 'Failed to update status', variant: 'destructive' }),
  });

  const applications: any[] = data ?? [];

  const getColumnApps = (status: string) =>
    applications.filter((a) => a.status === status);

  const getNextStatus = (current: string) => {
    const idx = COLUMNS.findIndex((c) => c.key === current);
    if (idx < COLUMNS.length - 2) return COLUMNS[idx + 1].key;
    return null;
  };

  if (isLoading) return (
    <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" /></div>
  );

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Kanban Board</h1>
          <p className="text-muted-foreground text-sm">Visual overview of your application pipeline</p>
        </div>
        <Link href="/applications">
          <Button><Plus className="h-4 w-4" />Add Application</Button>
        </Link>
      </div>

      <div className="flex gap-4 overflow-x-auto pb-4">
        {COLUMNS.map(({ key, label, variant, color }) => {
          const cards = getColumnApps(key);
          return (
            <div key={key} className="flex-shrink-0 w-64">
              <div className="flex items-center justify-between mb-2 px-1">
                <div className="flex items-center gap-2">
                  <Badge variant={variant}>{label}</Badge>
                  <span className="text-xs text-muted-foreground font-medium">{cards.length}</span>
                </div>
              </div>
              <div className={`rounded-xl border-2 ${color} min-h-[200px] p-2 space-y-2`}>
                {cards.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground/50">
                    <Briefcase className="h-6 w-6 mx-auto mb-1" />
                    <p className="text-xs">No applications</p>
                  </div>
                ) : (
                  cards.map((app) => {
                    const next = getNextStatus(app.status);
                    return (
                      <Card key={app.id} className="bg-white shadow-sm hover:shadow-md transition-shadow cursor-default">
                        <CardContent className="p-3 space-y-2">
                          <div className="flex items-start justify-between gap-1">
                            <div className="min-w-0">
                              <p className="font-semibold text-sm truncate">{app.company}</p>
                              <p className="text-xs text-muted-foreground truncate">{app.role}</p>
                            </div>
                            {app.jobUrl && (
                              <a href={app.jobUrl} target="_blank" rel="noreferrer" className="shrink-0">
                                <ExternalLink className="h-3.5 w-3.5 text-muted-foreground hover:text-primary" />
                              </a>
                            )}
                          </div>
                          {app.location && <p className="text-xs text-muted-foreground">{app.location}</p>}
                          {app.applyDate && (
                            <p className="text-xs text-muted-foreground">Applied {formatDate(app.applyDate)}</p>
                          )}
                          {next && (
                            <button
                              onClick={() => statusMutation.mutate({ id: app.id, status: next })}
                              disabled={statusMutation.isPending}
                              className="w-full text-xs border rounded-md py-1 px-2 text-muted-foreground hover:bg-muted transition-colors"
                            >
                              Move to {COLUMNS.find((c) => c.key === next)?.label} →
                            </button>
                          )}
                        </CardContent>
                      </Card>
                    );
                  })
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

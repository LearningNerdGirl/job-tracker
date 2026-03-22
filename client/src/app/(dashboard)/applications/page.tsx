'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Search, ExternalLink, Pencil, Trash2, Briefcase, ChevronDown } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Combobox } from '@/components/ui/combobox';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/hooks/use-toast';
import { formatDate, formatCurrency } from '@/lib/utils';
import api from '@/lib/api';

const STATUSES = ['WISHLIST', 'APPLIED', 'SCREENING', 'INTERVIEW', 'OFFER', 'REJECTED'] as const;
const STATUS_CONFIG: Record<string, { label: string; variant: any }> = {
  WISHLIST: { label: 'Wishlist', variant: 'gray' },
  APPLIED: { label: 'Applied', variant: 'blue' },
  SCREENING: { label: 'Screening', variant: 'warning' },
  INTERVIEW: { label: 'Interview', variant: 'purple' },
  OFFER: { label: 'Offer', variant: 'success' },
  REJECTED: { label: 'Rejected', variant: 'destructive' },
};

const schema = z.object({
  company: z.string().min(1, 'Company required'),
  role: z.string().min(1, 'Role required'),
  location: z.string().optional(),
  salaryMin: z.string().optional(),
  salaryMax: z.string().optional(),
  status: z.enum(STATUSES).default('WISHLIST'),
  applyDate: z.string().optional(),
  followUpDate: z.string().optional(),
  jobUrl: z.string().optional(),
  notes: z.string().optional(),
});
type FormData = z.infer<typeof schema>;

export default function ApplicationsPage() {
  const qc = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);

  const { data: suggestions } = useQuery({
    queryKey: ['suggestions'],
    queryFn: () => api.get('/applications/suggestions').then((r) => r.data.data),
  });

  const { data, isLoading } = useQuery({
    queryKey: ['applications', page, search, statusFilter],
    queryFn: () => api.get(`/applications?page=${page}&limit=10${search ? `&search=${search}` : ''}${statusFilter ? `&status=${statusFilter}` : ''}`).then((r) => r.data),
  });

  const { register, handleSubmit, reset, watch, setValue, formState: { errors } } = useForm<FormData>({ resolver: zodResolver(schema) });

  const saveMutation = useMutation({
    mutationFn: (d: FormData) => {
      const payload = { ...d, salaryMin: d.salaryMin ? Number(d.salaryMin) : undefined, salaryMax: d.salaryMax ? Number(d.salaryMax) : undefined };
      return editing ? api.put(`/applications/${editing.id}`, payload) : api.post('/applications', payload);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['applications'] });
      qc.invalidateQueries({ queryKey: ['stats-summary'] });
      qc.invalidateQueries({ queryKey: ['suggestions'] });
      toast({ title: editing ? 'Application updated' : 'Application added!' });
      setShowForm(false); setEditing(null); reset();
    },
    onError: (err: any) => toast({ title: 'Error', description: err.response?.data?.message, variant: 'destructive' }),
  });

  const statusMutation = useMutation({
    mutationFn: ({ id, status }: { id: number; status: string }) => api.patch(`/applications/${id}/status`, { status }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['applications'] }); qc.invalidateQueries({ queryKey: ['stats-summary'] }); },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => api.delete(`/applications/${id}`),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['applications'] }); qc.invalidateQueries({ queryKey: ['stats-summary'] }); toast({ title: 'Deleted' }); },
  });

  const openEdit = (app: any) => {
    reset({ company: app.company, role: app.role, location: app.location || '', salaryMin: app.salaryMin?.toString() || '', salaryMax: app.salaryMax?.toString() || '', status: app.status, applyDate: app.applyDate?.split('T')[0] || '', followUpDate: app.followUpDate?.split('T')[0] || '', jobUrl: app.jobUrl || '', notes: app.notes || '' });
    setEditing(app); setShowForm(true);
  };

  const applications = data?.data ?? [];
  const pagination = data?.pagination;

  return (
    <div className="space-y-5 max-w-6xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Applications</h1>
          <p className="text-muted-foreground text-sm">Track every opportunity in your pipeline</p>
        </div>
        <Button onClick={() => { reset({ status: 'WISHLIST' }); setEditing(null); setShowForm(!showForm); }}>
          <Plus className="h-4 w-4" />Add Application
        </Button>
      </div>

      {showForm && (
        <Card>
          <CardHeader><CardTitle className="text-base">{editing ? 'Edit Application' : 'New Application'}</CardTitle></CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit((d) => saveMutation.mutate(d))} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="space-y-1"><Label>Company *</Label><Combobox value={watch('company') ?? ''} onChange={(v) => setValue('company', v)} suggestions={suggestions?.companies ?? []} placeholder="Google" />{errors.company && <p className="text-xs text-destructive">{errors.company.message}</p>}</div>
              <div className="space-y-1"><Label>Role *</Label><Combobox value={watch('role') ?? ''} onChange={(v) => setValue('role', v)} suggestions={suggestions?.roles ?? []} placeholder="Software Engineer" />{errors.role && <p className="text-xs text-destructive">{errors.role.message}</p>}</div>
              <div className="space-y-1"><Label>Location</Label><Input placeholder="New York, NY / Remote" {...register('location')} /></div>
              <div className="space-y-1"><Label>Status</Label>
                <select {...register('status')} className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                  {STATUSES.map((s) => <option key={s} value={s}>{STATUS_CONFIG[s].label}</option>)}
                </select>
              </div>
              <div className="space-y-1"><Label>Salary Min ($)</Label><Input type="number" placeholder="80000" {...register('salaryMin')} /></div>
              <div className="space-y-1"><Label>Salary Max ($)</Label><Input type="number" placeholder="120000" {...register('salaryMax')} /></div>
              <div className="space-y-1"><Label>Apply Date</Label><Input type="date" {...register('applyDate')} /></div>
              <div className="space-y-1"><Label>Follow-up Date</Label><Input type="date" {...register('followUpDate')} /></div>
              <div className="space-y-1"><Label>Job URL</Label><Input type="url" placeholder="https://..." {...register('jobUrl')} /></div>
              <div className="sm:col-span-2 lg:col-span-3 space-y-1"><Label>Notes</Label><textarea {...register('notes')} placeholder="Interview notes, contacts, details..." className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm resize-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" /></div>
              <div className="sm:col-span-2 lg:col-span-3 flex gap-2">
                <Button type="submit" disabled={saveMutation.isPending}>{saveMutation.isPending ? 'Saving...' : 'Save'}</Button>
                <Button type="button" variant="outline" onClick={() => { setShowForm(false); setEditing(null); reset(); }}>Cancel</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input className="pl-9" placeholder="Search company or role..." value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} />
        </div>
        <select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }} className="flex h-10 rounded-md border border-input bg-background px-3 py-2 text-sm sm:w-44">
          <option value="">All Statuses</option>
          {STATUSES.map((s) => <option key={s} value={s}>{STATUS_CONFIG[s].label}</option>)}
        </select>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-16"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" /></div>
      ) : applications.length === 0 ? (
        <Card><CardContent className="text-center py-16 text-muted-foreground flex flex-col items-center gap-2">
          <Briefcase className="h-10 w-10 opacity-30" />
          <p className="font-medium">No applications found</p>
          <p className="text-sm">{search || statusFilter ? 'Try adjusting your filters' : 'Add your first application to get started'}</p>
        </CardContent></Card>
      ) : (
        <div className="rounded-lg border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[700px]">
              <thead className="bg-muted/50 border-b">
                <tr>{['Company', 'Role', 'Location', 'Salary', 'Status', 'Apply Date', 'Actions'].map((h) => <th key={h} className="text-left px-4 py-3 font-medium text-muted-foreground">{h}</th>)}</tr>
              </thead>
              <tbody>
                {applications.map((app: any) => (
                  <tr key={app.id} className="border-b last:border-0 hover:bg-muted/30 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold">{app.company}</span>
                        {app.jobUrl && <a href={app.jobUrl} target="_blank" rel="noreferrer"><ExternalLink className="h-3 w-3 text-muted-foreground hover:text-primary" /></a>}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">{app.role}</td>
                    <td className="px-4 py-3 text-muted-foreground">{app.location || '—'}</td>
                    <td className="px-4 py-3 text-muted-foreground text-xs">
                      {app.salaryMin || app.salaryMax ? `${formatCurrency(app.salaryMin)} – ${formatCurrency(app.salaryMax)}` : '—'}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <Badge variant={STATUS_CONFIG[app.status]?.variant}>{STATUS_CONFIG[app.status]?.label}</Badge>
                        <div className="relative group">
                          <button className="p-1 rounded hover:bg-muted"><ChevronDown className="h-3 w-3 text-muted-foreground" /></button>
                          <div className="absolute left-0 top-full mt-1 z-10 hidden group-hover:flex flex-col bg-card border rounded-md shadow-lg py-1 w-36">
                            {STATUSES.filter((s) => s !== app.status).map((s) => (
                              <button key={s} onClick={() => statusMutation.mutate({ id: app.id, status: s })} className="text-left px-3 py-1.5 text-xs hover:bg-muted transition-colors">
                                {STATUS_CONFIG[s].label}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground text-xs">{formatDate(app.applyDate)}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => openEdit(app)}><Pencil className="h-3.5 w-3.5" /></Button>
                        <Button size="icon" variant="ghost" className="h-7 w-7 text-destructive hover:text-destructive" onClick={() => { if (confirm('Delete this application?')) deleteMutation.mutate(app.id); }}><Trash2 className="h-3.5 w-3.5" /></Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {pagination && pagination.totalPages > 1 && (
            <div className="flex items-center justify-between px-4 py-3 border-t bg-muted/30">
              <span className="text-xs text-muted-foreground">Page {page} of {pagination.totalPages} · {pagination.total} total</span>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" disabled={page <= 1} onClick={() => setPage(page - 1)}>Previous</Button>
                <Button size="sm" variant="outline" disabled={page >= pagination.totalPages} onClick={() => setPage(page + 1)}>Next</Button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { LayoutDashboard, Briefcase, KanbanSquare, BarChart3, LogOut, Zap, Menu, X } from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/store/authStore';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';

const nav = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/applications', label: 'Applications', icon: Briefcase },
  { href: '/kanban', label: 'Kanban Board', icon: KanbanSquare },
  { href: '/analytics', label: 'Analytics', icon: BarChart3 },
];

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuthStore();
  const [open, setOpen] = useState(false);

  const handleLogout = () => { logout(); router.push('/login'); };

  const content = (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-2 px-5 py-5">
        <div className="bg-primary rounded-lg p-1.5"><Zap className="h-5 w-5 text-primary-foreground" /></div>
        <span className="font-bold text-lg tracking-tight">JobTrackr</span>
      </div>
      <Separator />
      <nav className="flex-1 px-3 py-4 space-y-1">
        {nav.map(({ href, label, icon: Icon }) => (
          <Link key={href} href={href} onClick={() => setOpen(false)} className={cn(
            'flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors',
            pathname === href || pathname.startsWith(href + '/')
              ? 'bg-primary text-primary-foreground'
              : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
          )}>
            <Icon className="h-4 w-4 shrink-0" />{label}
          </Link>
        ))}
      </nav>
      <Separator />
      <div className="px-4 py-4">
        <p className="text-xs font-medium mb-0.5 truncate">{user?.name}</p>
        <p className="text-xs text-muted-foreground mb-3 truncate">{user?.email}</p>
        <Button variant="ghost" size="sm" className="w-full justify-start gap-2 text-destructive hover:text-destructive" onClick={handleLogout}>
          <LogOut className="h-4 w-4" />Sign Out
        </Button>
      </div>
    </div>
  );

  return (
    <>
      <button className="fixed top-4 left-4 z-50 md:hidden bg-background border rounded-md p-2 shadow-sm" onClick={() => setOpen(!open)}>
        {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </button>
      {open && <div className="fixed inset-0 bg-black/50 z-40 md:hidden" onClick={() => setOpen(false)} />}
      <aside className={cn('fixed left-0 top-0 bottom-0 z-40 w-64 bg-background border-r transition-transform md:translate-x-0', open ? 'translate-x-0' : '-translate-x-full')}>
        {content}
      </aside>
    </>
  );
}

'use client';

import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { X } from 'lucide-react';

export function Toaster() {
  const { toasts } = useToast();
  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 w-80">
      {toasts.map((t) => (
        <div key={t.id} className={cn(
          'flex items-start gap-3 rounded-lg border p-4 shadow-lg animate-in slide-in-from-bottom-2',
          t.variant === 'destructive' ? 'bg-destructive text-destructive-foreground border-destructive' : 'bg-card text-card-foreground'
        )}>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold">{t.title}</p>
            {t.description && <p className="text-xs mt-0.5 opacity-80">{t.description}</p>}
          </div>
          <X className="h-4 w-4 shrink-0 opacity-70 cursor-pointer" />
        </div>
      ))}
    </div>
  );
}

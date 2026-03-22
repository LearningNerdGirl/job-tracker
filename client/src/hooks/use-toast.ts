import * as React from 'react';

type ToastVariant = 'default' | 'destructive';

interface Toast {
  id: string;
  title: string;
  description?: string;
  variant?: ToastVariant;
}

interface ToastState {
  toasts: Toast[];
}

const listeners: Array<(state: ToastState) => void> = [];
let memoryState: ToastState = { toasts: [] };

function dispatch(toast: Toast) {
  memoryState = { toasts: [toast, ...memoryState.toasts].slice(0, 3) };
  listeners.forEach((l) => l(memoryState));
  setTimeout(() => {
    memoryState = { toasts: memoryState.toasts.filter((t) => t.id !== toast.id) };
    listeners.forEach((l) => l(memoryState));
  }, 4000);
}

export function toast({ title, description, variant }: Omit<Toast, 'id'>) {
  dispatch({ id: Math.random().toString(36).slice(2), title, description, variant });
}

export function useToast() {
  const [state, setState] = React.useState<ToastState>(memoryState);
  React.useEffect(() => {
    listeners.push(setState);
    return () => { const i = listeners.indexOf(setState); if (i > -1) listeners.splice(i, 1); };
  }, []);
  return { toasts: state.toasts, toast };
}

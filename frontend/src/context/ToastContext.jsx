import { createContext, useEffect, useMemo, useState } from 'react';
import { CheckCircle2, Info, X, XCircle } from 'lucide-react';

export const ToastContext = createContext(null);

function ToastItem({ toast, onDismiss }) {
  const tones = {
    success: {
      icon: CheckCircle2,
      className: 'border-emerald-400/30 bg-emerald-400/12 text-emerald-50'
    },
    error: {
      icon: XCircle,
      className: 'border-rose-400/30 bg-rose-400/12 text-rose-50'
    },
    info: {
      icon: Info,
      className: 'border-sky-400/30 bg-sky-400/12 text-sky-50'
    }
  };

  const tone = tones[toast.type] || tones.info;
  const Icon = tone.icon;

  return (
    <div className={`pointer-events-auto w-full max-w-sm rounded-[24px] border p-4 shadow-[0_22px_60px_rgba(0,0,0,0.28)] backdrop-blur-xl ${tone.className}`}>
      <div className="flex items-start gap-3">
        <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-black/15">
          <Icon className="h-4.5 w-4.5" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold">{toast.title}</p>
          {toast.message ? <p className="mt-1 text-sm leading-6 text-white/85">{toast.message}</p> : null}
        </div>
        <button
          type="button"
          onClick={() => onDismiss(toast.id)}
          className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-black/10 text-white/70 transition hover:bg-black/20 hover:text-white"
          aria-label="Dismiss notification"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  useEffect(() => {
    if (!toasts.length) {
      return undefined;
    }

    const timers = toasts.map((toast) =>
      window.setTimeout(() => {
        setToasts((current) => current.filter((item) => item.id !== toast.id));
      }, toast.duration || 4000)
    );

    return () => {
      timers.forEach((timer) => window.clearTimeout(timer));
    };
  }, [toasts]);

  function show(toast) {
    const id = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    setToasts((current) => [...current, { duration: 4000, type: 'info', ...toast, id }]);
  }

  function dismiss(id) {
    setToasts((current) => current.filter((toast) => toast.id !== id));
  }

  const value = useMemo(
    () => ({
      show,
      success(title, message) {
        show({ type: 'success', title, message });
      },
      error(title, message) {
        show({ type: 'error', title, message });
      },
      info(title, message) {
        show({ type: 'info', title, message });
      },
      dismiss
    }),
    []
  );

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="pointer-events-none fixed right-4 top-4 z-[100] flex w-[calc(100vw-2rem)] max-w-sm flex-col gap-3 sm:right-6 sm:top-6">
        {toasts.map((toast) => (
          <ToastItem key={toast.id} toast={toast} onDismiss={dismiss} />
        ))}
      </div>
    </ToastContext.Provider>
  );
}

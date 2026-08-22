import React, { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle2, AlertTriangle, XCircle, Info, X } from 'lucide-react';

const NotificationContext = createContext(null);

export function NotificationProvider({ children }) {
  const [notifications, setNotifications] = useState([]);

  const addNotification = useCallback((type, message, duration = 4000) => {
    const id = Date.now() + Math.random().toString(36).substr(2, 4);
    setNotifications((prev) => [...prev, { id, type, message }]);

    if (duration > 0) {
      setTimeout(() => {
        setNotifications((prev) => prev.filter((n) => n.id !== id));
      }, duration);
    }
  }, []);

  const removeNotification = useCallback((id) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  }, []);

  const notify = {
    success: (msg, dur) => addNotification('success', msg, dur),
    error: (msg, dur) => addNotification('error', msg, dur),
    warning: (msg, dur) => addNotification('warning', msg, dur),
    info: (msg, dur) => addNotification('info', msg, dur)
  };

  return (
    <NotificationContext.Provider value={notify}>
      {children}
      {/* Toast Notification Container */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2 pointer-events-none max-w-md w-full px-4">
        {notifications.map((n) => (
          <div
            key={n.id}
            className={`pointer-events-auto flex items-center justify-between p-4 rounded-xl shadow-2xl backdrop-blur-lg border transition-all animate-bounce-short ${
              n.type === 'success'
                ? 'bg-emerald-950/90 text-emerald-100 border-emerald-500/30'
                : n.type === 'error'
                ? 'bg-rose-950/90 text-rose-100 border-rose-500/30'
                : n.type === 'warning'
                ? 'bg-amber-950/90 text-amber-100 border-amber-500/30'
                : 'bg-slate-900/90 text-slate-100 border-indigo-500/30'
            }`}
          >
            <div className="flex items-center gap-3">
              {n.type === 'success' && <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />}
              {n.type === 'error' && <XCircle className="w-5 h-5 text-rose-400 shrink-0" />}
              {n.type === 'warning' && <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0" />}
              {n.type === 'info' && <Info className="w-5 h-5 text-indigo-400 shrink-0" />}
              <p className="text-sm font-medium leading-snug">{n.message}</p>
            </div>
            <button
              onClick={() => removeNotification(n.id)}
              className="p-1 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white transition ml-3"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
    </NotificationContext.Provider>
  );
}

export function useNotification() {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification must be used within NotificationProvider');
  }
  return context;
}

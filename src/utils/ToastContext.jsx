import { createContext, useContext, useState, useCallback } from "react";

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = "success", duration = 3500) => {
    const id = Date.now() + Math.random();
    setToasts(prev => [...prev, { id, message, type }]);
    if (duration > 0) {
      setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), duration);
    }
    return id;
  }, []);

  const removeToast = useCallback((id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const icons = { success: "✅", error: "❌", warning: "⚠️", info: "ℹ️" };
  const colors = {
    success: "from-emerald-600/95 to-emerald-700/95 border-emerald-500/50 shadow-emerald-900/40",
    error:   "from-red-600/95 to-red-700/95 border-red-500/50 shadow-red-900/40",
    warning: "from-amber-600/95 to-amber-700/95 border-amber-500/50 shadow-amber-900/40",
    info:    "from-indigo-600/95 to-indigo-700/95 border-indigo-500/50 shadow-indigo-900/40",
  };

  return (
    <ToastContext.Provider value={{ addToast, removeToast }}>
      {children}

      {/* Toast Overlay */}
      <div className="fixed bottom-6 right-6 z-[99999] flex flex-col gap-3 pointer-events-none">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-center gap-3 px-5 py-4 rounded-2xl border bg-gradient-to-br ${colors[toast.type] || colors.success} backdrop-blur-xl shadow-2xl text-white min-w-[270px] max-w-[380px] animate-in slide-in-from-right-5 fade-in duration-300`}
          >
            <span className="text-xl shrink-0">{icons[toast.type] || icons.success}</span>
            <span className="flex-1 font-bold text-sm leading-tight">{toast.message}</span>
            <button
              onClick={() => removeToast(toast.id)}
              className="shrink-0 w-6 h-6 flex items-center justify-center rounded-lg bg-white/10 hover:bg-white/25 text-white/70 hover:text-white transition-all text-lg font-light leading-none"
            >
              ×
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used inside <ToastProvider>");
  return ctx;
}

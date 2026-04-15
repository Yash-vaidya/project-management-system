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
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used inside <ToastProvider>");
  return ctx;
}

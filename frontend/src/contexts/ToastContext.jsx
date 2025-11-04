import React, { createContext, useContext, useState, useCallback } from 'react';

const ToastContext = createContext();

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const push = useCallback((message, opts = {}) => {
    const id = Math.random().toString(36).slice(2, 9);
    const toast = { id, message, ...opts };
    setToasts(prev => [...prev, toast]);
    if (!opts.sticky) {
      setTimeout(() => {
        setToasts(prev => prev.filter(t => t.id !== id));
      }, opts.duration || 4000);
    }
    return id;
  }, []);

  const remove = useCallback((id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ toasts, push, remove }}>
      {children}
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within ToastProvider');
  return ctx;
};

export default ToastContext;

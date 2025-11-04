import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react';
import { useToast } from '../../contexts/ToastContext';

const ToastContainer = () => {
  const { toasts, remove } = useToast();

  const icons = {
    success: <CheckCircle className="w-5 h-5 text-green-500" />,
    error: <AlertCircle className="w-5 h-5 text-red-500" />,
    warning: <AlertTriangle className="w-5 h-5 text-yellow-500" />,
    info: <Info className="w-5 h-5 text-blue-500" />
  };

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2">
      <AnimatePresence>
        {toasts.map((toast) => (
          <motion.div
            key={toast.id}
            initial={{ opacity: 0, y: -20, x: 100 }}
            animate={{ opacity: 1, y: 0, x: 0 }}
            exit={{ opacity: 0, x: 100 }}
            className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4 min-w-[300px] max-w-md border dark:border-gray-700"
          >
            <div className="flex items-start">
              <div className="flex-shrink-0">
                {icons[toast.type || 'info']}
              </div>
              <div className="ml-3 flex-1">
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  {toast.message}
                </p>
                {toast.description && (
                  <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                    {toast.description}
                  </p>
                )}
              </div>
              <button
                onClick={() => remove(toast.id)}
                className="ml-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};

export default ToastContainer;

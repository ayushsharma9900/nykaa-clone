'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { CheckCircleIcon, XMarkIcon } from '@heroicons/react/24/outline';

interface Toast {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info';
}

interface ToastContextType {
  showToast: (message: string, type?: 'success' | 'error' | 'info') => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    const id = Math.random().toString(36).substring(7);
    const newToast: Toast = { id, message, type };
    
    setToasts(prev => [...prev, newToast]);

    // Auto remove toast after 3 seconds
    setTimeout(() => {
      setToasts(prev => prev.filter(toast => toast.id !== id));
    }, 3000);
  };

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      
      {/* Toast Container */}
      <div className="fixed top-4 right-4 z-50 space-y-2">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`flex items-center p-4 rounded-lg shadow-lg max-w-sm animate-in slide-in-from-right ${
              toast.type === 'success' 
                ? 'bg-green-50 border border-green-200' 
                : toast.type === 'error'
                ? 'bg-red-50 border border-red-200'
                : 'bg-blue-50 border border-blue-200'
            }`}
          >
            {toast.type === 'success' && (
              <CheckCircleIcon className="h-5 w-5 text-green-500 mr-3 flex-shrink-0" />
            )}
            <p className={`text-sm font-medium flex-1 ${
              toast.type === 'success' 
                ? 'text-green-800' 
                : toast.type === 'error'
                ? 'text-red-800'
                : 'text-blue-800'
            }`}>
              {toast.message}
            </p>
            <button
              onClick={() => removeToast(toast.id)}
              className={`ml-2 hover:opacity-75 ${
                toast.type === 'success' 
                  ? 'text-green-500' 
                  : toast.type === 'error'
                  ? 'text-red-500'
                  : 'text-blue-500'
              }`}
            >
              <XMarkIcon className="h-4 w-4" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (context === undefined) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}
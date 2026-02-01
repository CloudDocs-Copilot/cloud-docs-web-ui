import { createContext } from 'react';

export type ToastVariant = 'success' | 'danger' | 'warning' | 'info';

export interface ToastOptions {
  message: string;
  variant?: ToastVariant;
  title?: string;
}

export interface ToastContextValue {
  showToast: (opts: ToastOptions) => void;
  hideToast: () => void;
}

export const ToastContext = createContext<ToastContextValue | null>(null);

import React, { useState } from 'react';
import { NotificationToast } from '../components/NotificationToast';
import { ToastContext, type ToastOptions } from './ToastContext';

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [show, setShow] = useState(false);
  const [message, setMessage] = useState('');
  const [variant, setVariant] = useState<'success' | 'danger' | 'warning' | 'info'>('success');
  const [title, setTitle] = useState<string | undefined>(undefined);

  const showToast = ({ message, variant = 'success', title }: ToastOptions) => {
    setMessage(message);
    setVariant(variant);
    setTitle(title);
    setShow(true);
  };

  const hideToast = () => setShow(false);

  return (
    <ToastContext.Provider value={{ showToast, hideToast }}>
      {children}
      <NotificationToast show={show} onClose={hideToast} message={message} variant={variant} title={title} />
    </ToastContext.Provider>
  );
};

export default ToastProvider;

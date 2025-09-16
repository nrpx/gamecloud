'use client';

import { toast } from 'react-toastify';

// Типы для Toast уведомлений
export type ToastType = 'success' | 'error' | 'warning' | 'info' | 'default';

// Основные Toast функции
export const showToast = {
  success: (message: string) => {
    return toast.success(message);
  },
  
  error: (message: string) => {
    return toast.error(message);
  },
  
  warning: (message: string) => {
    return toast.warning(message);
  },
  
  info: (message: string) => {
    return toast.info(message);
  },
  
  default: (message: string) => {
    return toast(message);
  }
};

// Удобные aliases для backward compatibility
export const showSuccess = (title: string, text?: string) => {
  const message = text ? `${title}: ${text}` : title;
  return toast.success(message);
};

export const showError = (title: string, text?: string) => {
  const message = text ? `${title}: ${text}` : title;
  return toast.error(message);
};

export const showInfo = (title: string, text?: string) => {
  const message = text ? `${title}: ${text}` : title;
  return toast.info(message);
};

export const showWarningToast = (title: string, text?: string) => {
  const message = text ? `${title}: ${text}` : title;
  return toast.warning(message);
};

// Дополнительные утилиты
export const dismissToast = (toastId?: string | number) => {
  if (toastId) {
    toast.dismiss(toastId);
  } else {
    toast.dismiss();
  }
};

export const isActiveToast = (toastId: string | number) => {
  return toast.isActive(toastId);
};

export default toast;
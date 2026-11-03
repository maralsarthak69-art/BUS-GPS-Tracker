import React from 'react';

export interface ToastMessage {
  id: string;
  title: string;
  description: string;
}

interface ToastProps {
  toasts: ToastMessage[];
  onDismiss: (id: string) => void;
}

export const Toast: React.FC<ToastProps> = ({ toasts, onDismiss }) => {
  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className="pointer-events-auto flex items-start gap-space-sm bg-inverse-surface text-inverse-on-surface p-space-md rounded-xl shadow-2xl border border-outline/20 animate-in fade-in slide-in-from-bottom-5 duration-200"
        >
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 mt-1 shrink-0 animate-pulse"></div>
          <div className="flex flex-col flex-1 min-w-0">
            <span className="font-label-md text-label-md font-semibold text-surface-container-lowest">
              {toast.title}
            </span>
            <span className="font-body-sm text-body-sm text-outline-variant mt-0.5 break-words">
              {toast.description}
            </span>
          </div>
          <button
            onClick={() => onDismiss(toast.id)}
            className="text-outline-variant hover:text-white p-0.5"
            type="button"
          >
            <span className="material-symbols-outlined text-[16px]">close</span>
          </button>
        </div>
      ))}
    </div>
  );
};

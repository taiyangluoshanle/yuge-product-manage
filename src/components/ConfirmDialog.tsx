"use client";

import { AlertTriangle } from "lucide-react";

interface ConfirmDialogProps {
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export const ConfirmDialog = ({
  title,
  message,
  confirmLabel = "确认",
  cancelLabel = "取消",
  onConfirm,
  onCancel,
}: ConfirmDialogProps) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div
        className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl"
        role="alertdialog"
        aria-labelledby="confirm-title"
        aria-describedby="confirm-message"
      >
        <div className="mb-4 flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-red-100">
            <AlertTriangle className="h-5 w-5 text-red-600" />
          </div>
          <h3 id="confirm-title" className="text-lg font-semibold text-gray-900">
            {title}
          </h3>
        </div>
        <p id="confirm-message" className="mb-6 text-sm text-gray-600">
          {message}
        </p>
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="btn-secondary flex-1"
            autoFocus
          >
            {cancelLabel}
          </button>
          <button onClick={onConfirm} className="btn-danger flex-1">
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
};

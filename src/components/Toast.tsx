"use client";

import { useEffect, useState } from "react";
import { CheckCircle, XCircle, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface ToastProps {
  message: string;
  type?: "success" | "error";
  onClose: () => void;
  duration?: number;
}

export const Toast = ({
  message,
  type = "success",
  onClose,
  duration = 3000,
}: ToastProps) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(onClose, 300);
    }, duration);
    return () => clearTimeout(timer);
  }, [duration, onClose]);

  return (
    <div
      className={cn(
        "fixed left-1/2 top-4 z-[100] flex -translate-x-1/2 items-center gap-2 rounded-lg px-4 py-3 shadow-lg transition-all duration-300",
        isVisible ? "translate-y-0 opacity-100" : "-translate-y-4 opacity-0",
        type === "success" ? "bg-green-600 text-white" : "bg-red-600 text-white"
      )}
      role="alert"
    >
      {type === "success" ? (
        <CheckCircle className="h-5 w-5 shrink-0" />
      ) : (
        <XCircle className="h-5 w-5 shrink-0" />
      )}
      <span className="text-sm font-medium">{message}</span>
      <button
        onClick={() => {
          setIsVisible(false);
          setTimeout(onClose, 300);
        }}
        className="ml-2 shrink-0"
        aria-label="关闭提示"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
};

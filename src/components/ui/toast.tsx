"use client";
import * as React from "react";

type ToastProps = {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  intent?: "success" | "error" | "info";
  message: string;
  duration?: number;
};

export function Toast({ open, onOpenChange, intent = "info", message, duration = 3000 }: ToastProps) {
  React.useEffect(() => {
    if (!open) return;
    const id = window.setTimeout(() => onOpenChange(false), duration);
    return () => window.clearTimeout(id);
  }, [open, onOpenChange, duration]);

  if (!open) return null;
  const cls =
    intent === "success"
      ? "bg-emerald-600 text-white"
      : intent === "error"
      ? "bg-red-600 text-white"
      : "bg-slate-800 text-white";

  return (
    <div className={`fixed top-4 left-1/2 -translate-x-1/2 z-50 rounded-md px-3 py-2 shadow-lg ${cls}`} role="status">
      <span className="text-sm">{message}</span>
    </div>
  );
}


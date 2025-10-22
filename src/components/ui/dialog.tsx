"use client";
import * as React from "react";

type DialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: React.ReactNode;
};

export function Dialog({ open, onOpenChange, children }: DialogProps) {
  React.useEffect(() => {
    if (open) {
      const onKey = (e: KeyboardEvent) => {
        if (e.key === "Escape") onOpenChange(false);
      };
      document.addEventListener("keydown", onKey);
      return () => document.removeEventListener("keydown", onKey);
    }
  }, [open, onOpenChange]);

  if (!open) return null;
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      aria-modal="true"
      role="dialog"
    >
      <div className="absolute inset-0 bg-black/40" onClick={() => onOpenChange(false)} />
      <div className="relative z-10 w-[90vw] max-w-md rounded-lg border border-slate-200 bg-white p-4 shadow-lg">
        {children}
      </div>
    </div>
  );
}

export function DialogHeader({ children }: { children?: React.ReactNode }) {
  return <div className="mb-3 text-base font-semibold text-slate-800">{children}</div>;
}

export function DialogFooter({ children }: { children?: React.ReactNode }) {
  return <div className="mt-4 flex justify-end gap-2">{children}</div>;
}


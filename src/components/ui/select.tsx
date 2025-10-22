"use client";
import * as React from "react";

export type Option = { value: string; label: React.ReactNode };

type SelectProps = {
  value: string;
  onValueChange: (v: string) => void;
  options: Option[];
  placeholder?: string;
  className?: string;
};

export function Select({ value, onValueChange, options, placeholder, className = "" }: SelectProps) {
  const [open, setOpen] = React.useState(false);
  const selected = options.find((o) => o.value === value);
  const buttonRef = React.useRef<HTMLButtonElement | null>(null);
  const rootRef = React.useRef<HTMLDivElement | null>(null);
  const menuRef = React.useRef<HTMLDivElement | null>(null);
  const closerRef = React.useRef<((this: Document, ev: MouseEvent) => any) | null>(null);

  React.useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    const timeoutId = window.setTimeout(() => {
      const closer = () => setOpen(false);
      closerRef.current = closer;
      document.addEventListener("click", closer, { once: true });
    }, 0);
    // Prevent React Flow from zooming when the menu is open
    const stopWheel = (e: WheelEvent) => {
      e.stopPropagation();
    };
    menuRef.current?.addEventListener("wheel", stopWheel, { passive: false });

    return () => {
      document.removeEventListener("keydown", onKey);
      window.clearTimeout(timeoutId);
      if (closerRef.current) {
        // In case it wasn't fired yet
        document.removeEventListener("click", closerRef.current);
        closerRef.current = null;
      }
      menuRef.current?.removeEventListener("wheel", stopWheel as any);
    };
  }, [open]);

  // Fallback: close if parent changes value programmatically while open
  React.useEffect(() => {
    if (open) setOpen(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  return (
    <div ref={rootRef} className={`relative ${className}`}>
      <button
        ref={buttonRef}
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className="flex h-10 w-full items-center justify-between rounded-md border border-slate-300 bg-white px-3 text-left text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        <span className="truncate">{selected ? selected.label : placeholder ?? "Выбрать"}</span>
        <svg className="ml-2 h-4 w-4 text-slate-500 transition-transform" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 10.94l3.71-3.71a.75.75 0 011.08 1.04l-4.25 4.25a.75.75 0 01-1.08 0L5.21 8.27a.75.75 0 01.02-1.06z" clipRule="evenodd" />
        </svg>
      </button>
      {open && (
        <div
          role="listbox"
          ref={menuRef}
          onWheel={(e) => e.stopPropagation()}
          className="absolute z-20 mt-2 max-h-56 w-full overflow-auto rounded-md border border-slate-200 bg-white p-1 shadow-lg ring-1 ring-black/5 transition-all duration-150 origin-top scale-100 opacity-100"
        >
          {options.map((opt) => (
            <button
              key={opt.value}
              role="option"
              aria-selected={opt.value === value}
              className={`flex w-full items-center justify-between rounded px-2 py-2 text-sm text-slate-800 hover:bg-slate-100 ${
                opt.value === value ? "bg-slate-100" : ""
              }`}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onValueChange(opt.value);
                setOpen(false);
                // Ensure close after React state flush
                setTimeout(() => setOpen(false), 0);
                buttonRef.current?.focus();
              }}
            >
              <span className="truncate">{opt.label}</span>
              {opt.value === value && <span className="text-blue-600">✓</span>}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

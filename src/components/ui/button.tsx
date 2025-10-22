"use client";
import * as React from "react";

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "default" | "secondary" | "destructive";
  size?: "sm" | "md";
};

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className = "", variant = "default", size = "md", ...props }, ref) => {
    const base =
      "inline-flex items-center justify-center rounded-md font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 disabled:opacity-50 disabled:pointer-events-none transition-colors transition-transform duration-150 ease-out transform-gpu hover:-translate-y-0.5 active:scale-95";
    const variants = {
      default: "bg-slate-900 text-white hover:bg-slate-800",
      secondary: "bg-slate-100 text-slate-900 hover:bg-slate-200",
      destructive: "bg-red-600 text-white hover:bg-red-700",
    } as const;
    const sizes = { sm: "h-8 px-3 text-sm", md: "h-10 px-4 text-sm" } as const;
    return (
      <button
        ref={ref}
        className={`${base} ${variants[variant]} ${sizes[size]} ${className}`}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

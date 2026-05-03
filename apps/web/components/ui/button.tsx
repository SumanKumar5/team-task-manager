"use client";

import { cn } from "@/lib/utils";
import { type ButtonHTMLAttributes, forwardRef } from "react";

type Variant = "primary" | "secondary" | "ghost" | "danger" | "outline";
type Size = "sm" | "md" | "lg";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = "primary",
      size = "md",
      loading,
      disabled,
      children,
      ...props
    },
    ref,
  ) => {
    return (
      <button
        ref={ref}
        disabled={disabled ?? loading}
        className={cn(
          "inline-flex items-center justify-center gap-2 font-medium rounded-lg transition-all duration-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed select-none",
          {
            "bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] text-white shadow-lg shadow-[var(--color-primary)]/20":
              variant === "primary",
            "bg-[var(--color-surface-2)] hover:bg-[var(--color-surface-3)] text-[var(--color-text)] border border-[var(--color-border)]":
              variant === "secondary",
            "hover:bg-[var(--color-surface-2)] text-[var(--color-text-muted)] hover:text-[var(--color-text)]":
              variant === "ghost",
            "bg-[var(--color-danger)]/10 hover:bg-[var(--color-danger)]/20 text-[var(--color-danger)] border border-[var(--color-danger)]/20":
              variant === "danger",
            "border border-[var(--color-border)] hover:border-[var(--color-primary)] hover:text-[var(--color-primary)] text-[var(--color-text-muted)]":
              variant === "outline",
          },
          {
            "text-xs px-3 py-1.5 h-7": size === "sm",
            "text-sm px-4 py-2 h-9": size === "md",
            "text-base px-6 py-2.5 h-11": size === "lg",
          },
          className,
        )}
        {...props}
      >
        {loading && (
          <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
            />
          </svg>
        )}
        {children}
      </button>
    );
  },
);

Button.displayName = "Button";

"use client";

import { cn } from "@/lib/utils";
import { forwardRef, type InputHTMLAttributes } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, icon, ...props }, ref) => {
    return (
      <div className="flex flex-col gap-1.5 w-full">
        {label && (
          <label className="text-sm font-medium text-[var(--color-text-muted)]">
            {label}
          </label>
        )}
        <div className="relative">
          {icon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-subtle)]">
              {icon}
            </div>
          )}
          <input
            ref={ref}
            className={cn(
              "w-full h-10 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface-2)] px-3 py-2 text-sm text-[var(--color-text)] placeholder:text-[var(--color-text-subtle)] transition-all duration-200",
              "focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/40 focus:border-[var(--color-primary)]",
              "disabled:opacity-50 disabled:cursor-not-allowed",
              icon && "pl-10",
              error &&
                "border-[var(--color-danger)] focus:ring-[var(--color-danger)]/40",
              className,
            )}
            {...props}
          />
        </div>
        {error && <p className="text-xs text-[var(--color-danger)]">{error}</p>}
      </div>
    );
  },
);

Input.displayName = "Input";

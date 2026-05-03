"use client";

import { cn } from "@/lib/utils";
import { forwardRef, type TextareaHTMLAttributes } from "react";

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, label, error, ...props }, ref) => {
    return (
      <div className="flex flex-col gap-1.5 w-full">
        {label && (
          <label className="text-sm font-medium text-[var(--color-text-muted)]">
            {label}
          </label>
        )}
        <textarea
          ref={ref}
          className={cn(
            "w-full min-h-[100px] rounded-lg border border-[var(--color-border)] bg-[var(--color-surface-2)] px-3 py-2 text-sm text-[var(--color-text)] placeholder:text-[var(--color-text-subtle)] transition-all duration-200 resize-none",
            "focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/40 focus:border-[var(--color-primary)]",
            "disabled:opacity-50 disabled:cursor-not-allowed",
            error && "border-[var(--color-danger)]",
            className,
          )}
          {...props}
        />
        {error && <p className="text-xs text-[var(--color-danger)]">{error}</p>}
      </div>
    );
  },
);

Textarea.displayName = "Textarea";

"use client";

import { cn } from "@/lib/utils";
import { forwardRef, type SelectHTMLAttributes } from "react";
import { ChevronDown } from "lucide-react";

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: { value: string; label: string }[];
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, label, error, options, ...props }, ref) => {
    return (
      <div className="flex flex-col gap-1.5 w-full">
        {label && (
          <label className="text-sm font-medium text-[var(--color-text-muted)]">
            {label}
          </label>
        )}
        <div className="relative">
          <select
            ref={ref}
            className={cn(
              "w-full h-10 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface-2)] px-3 py-2 text-sm text-[var(--color-text)] transition-all duration-200 appearance-none cursor-pointer pr-10",
              "focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/40 focus:border-[var(--color-primary)]",
              "disabled:opacity-50 disabled:cursor-not-allowed",
              error && "border-[var(--color-danger)]",
              className,
            )}
            {...props}
          >
            {options.map((opt) => (
              <option
                key={opt.value}
                value={opt.value}
                className="bg-[var(--color-surface-2)]"
              >
                {opt.label}
              </option>
            ))}
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--color-text-subtle)] pointer-events-none" />
        </div>
        {error && <p className="text-xs text-[var(--color-danger)]">{error}</p>}
      </div>
    );
  },
);

Select.displayName = "Select";

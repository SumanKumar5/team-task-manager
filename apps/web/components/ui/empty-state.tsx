import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: React.ReactNode;
  className?: string;
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center py-16 text-center",
        className,
      )}
    >
      <div className="rounded-full bg-[var(--color-surface-2)] p-4 mb-4">
        <Icon className="h-8 w-8 text-[var(--color-text-subtle)]" />
      </div>
      <h3 className="text-base font-semibold text-[var(--color-text)] mb-1">
        {title}
      </h3>
      <p className="text-sm text-[var(--color-text-muted)] max-w-sm mb-6">
        {description}
      </p>
      {action}
    </div>
  );
}

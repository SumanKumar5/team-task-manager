import { cn } from "@/lib/utils";

type BadgeVariant =
  | "default"
  | "success"
  | "warning"
  | "danger"
  | "info"
  | "purple";

interface BadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
  className?: string;
}

export function Badge({
  children,
  variant = "default",
  className,
}: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium",
        {
          "bg-[var(--color-surface-3)] text-[var(--color-text-muted)]":
            variant === "default",
          "bg-[var(--color-success)]/10 text-[var(--color-success)]":
            variant === "success",
          "bg-[var(--color-warning)]/10 text-[var(--color-warning)]":
            variant === "warning",
          "bg-[var(--color-danger)]/10 text-[var(--color-danger)]":
            variant === "danger",
          "bg-[var(--color-info)]/10 text-[var(--color-info)]":
            variant === "info",
          "bg-[var(--color-primary)]/10 text-[var(--color-primary)]":
            variant === "purple",
        },
        className,
      )}
    >
      {children}
    </span>
  );
}

import { cn } from "@/lib/utils";

interface CardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
  onClick?: () => void;
}

export function Card({ children, className, hover, onClick }: CardProps) {
  return (
    <div
      onClick={onClick}
      className={cn(
        "rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-6",
        hover &&
          "hover:border-[var(--color-primary)]/40 hover:bg-[var(--color-surface-2)] transition-all duration-200 cursor-pointer",
        onClick && "cursor-pointer",
        className,
      )}
    >
      {children}
    </div>
  );
}

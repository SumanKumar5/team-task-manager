import { cn } from "@/lib/utils";

interface AvatarProps {
  name: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}

const colors = [
  "bg-purple-500",
  "bg-blue-500",
  "bg-green-500",
  "bg-yellow-500",
  "bg-red-500",
  "bg-pink-500",
  "bg-indigo-500",
  "bg-teal-500",
];

function getColor(name: string) {
  const index = name.charCodeAt(0) % colors.length;
  return colors[index];
}

export function Avatar({ name, size = "md", className }: AvatarProps) {
  const initials = name
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <div
      className={cn(
        "rounded-full flex items-center justify-center font-semibold text-white shrink-0",
        getColor(name),
        {
          "h-6 w-6 text-xs": size === "sm",
          "h-8 w-8 text-sm": size === "md",
          "h-10 w-10 text-base": size === "lg",
        },
        className,
      )}
    >
      {initials}
    </div>
  );
}

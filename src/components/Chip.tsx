import { cn } from "@/lib/utils";

export function Chip({
  children,
  className
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border border-amber-200/70 bg-white/80 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-dusk",
        className
      )}
    >
      {children}
    </span>
  );
}

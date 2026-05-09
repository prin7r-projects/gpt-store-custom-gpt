import { cn } from "@/lib/cn";

export function SaffronMark({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <mark
      className={cn(
        "bg-gradient-to-b from-transparent from-60% to-saffron/40 to-60% px-[0.08em] whitespace-pre-wrap rounded-none text-inherit",
        className
      )}
    >
      {children}
    </mark>
  );
}

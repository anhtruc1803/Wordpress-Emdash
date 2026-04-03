import { cn } from "@/lib/utils";

export function StickyActionBar({
  children,
  className
}: React.PropsWithChildren<{ className?: string }>) {
  return (
    <div className={cn("sticky top-[73px] z-20 mb-6 rounded-2xl border border-line bg-white/92 px-4 py-3 shadow-panel backdrop-blur", className)}>
      <div className="flex flex-wrap items-center gap-2">{children}</div>
    </div>
  );
}

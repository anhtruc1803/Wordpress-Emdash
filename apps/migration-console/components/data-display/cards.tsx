import { cn } from "@/lib/utils";

export function Panel({
  children,
  className
}: React.PropsWithChildren<{ className?: string }>) {
  return <section className={cn("rounded-2xl border border-line bg-panel shadow-panel", className)}>{children}</section>;
}

export function StatCard({
  label,
  value,
  detail,
  tone = "neutral"
}: {
  label: string;
  value: string;
  detail?: string;
  tone?: "neutral" | "info" | "warning" | "danger" | "success";
}) {
  const accentClass =
    tone === "info"
      ? "text-blue-700"
      : tone === "warning"
        ? "text-amber-700"
        : tone === "danger"
          ? "text-rose-700"
          : tone === "success"
            ? "text-emerald-700"
            : "text-slate-900";

  return (
    <Panel className="p-5">
      <div className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-muted">{label}</p>
        <p className={cn("text-3xl font-semibold tracking-tight", accentClass)}>{value}</p>
        {detail ? <p className="text-sm text-muted">{detail}</p> : null}
      </div>
    </Panel>
  );
}

export function SectionHeader({
  eyebrow,
  title,
  description,
  actions
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  actions?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-4 border-b border-line px-5 py-4 sm:flex-row sm:items-start sm:justify-between">
      <div className="space-y-2">
        {eyebrow ? <p className="text-xs font-semibold uppercase tracking-[0.22em] text-muted">{eyebrow}</p> : null}
        <div className="space-y-1">
          <h2 className="text-lg font-semibold tracking-tight text-slate-950">{title}</h2>
          {description ? <p className="max-w-3xl text-sm leading-6 text-muted">{description}</p> : null}
        </div>
      </div>
      {actions ? <div className="flex flex-wrap gap-2">{actions}</div> : null}
    </div>
  );
}

export function KeyValueList({
  values
}: {
  values: Array<{ label: string; value: React.ReactNode }>;
}) {
  return (
    <dl className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {values.map((entry) => (
        <div key={entry.label} className="rounded-2xl border border-line bg-panel-strong p-4">
          <dt className="text-xs font-semibold uppercase tracking-[0.18em] text-muted">{entry.label}</dt>
          <dd className="mt-2 text-sm font-medium text-slate-900">{entry.value}</dd>
        </div>
      ))}
    </dl>
  );
}

import { AlertTriangle, FolderSearch, LoaderCircle } from "lucide-react";

import { Panel } from "./cards";

export function EmptyState({
  title,
  description,
  action
}: {
  title: string;
  description: string;
  action?: React.ReactNode;
}) {
  return (
    <Panel className="flex min-h-72 flex-col items-center justify-center gap-4 p-8 text-center">
      <FolderSearch className="h-10 w-10 text-muted" />
      <div className="space-y-2">
        <h3 className="text-xl font-semibold tracking-tight text-slate-950">{title}</h3>
        <p className="max-w-xl text-sm leading-6 text-muted">{description}</p>
      </div>
      {action}
    </Panel>
  );
}

export function ErrorState({ title, description }: { title: string; description: string }) {
  return (
    <Panel className="flex min-h-72 flex-col items-center justify-center gap-4 p-8 text-center">
      <AlertTriangle className="h-10 w-10 text-rose-600" />
      <div className="space-y-2">
        <h3 className="text-xl font-semibold tracking-tight text-slate-950">{title}</h3>
        <p className="max-w-xl text-sm leading-6 text-muted">{description}</p>
      </div>
    </Panel>
  );
}

export function LoadingState({ label = "Đang tải dữ liệu workspace..." }: { label?: string }) {
  return (
    <Panel className="flex min-h-72 items-center justify-center gap-3 p-8 text-sm font-medium text-muted">
      <LoaderCircle className="h-5 w-5 animate-spin" />
      {label}
    </Panel>
  );
}
